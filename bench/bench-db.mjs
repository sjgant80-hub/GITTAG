#!/usr/bin/env node
// bench-db.mjs — benchmark the GitTAG "issues DB"
//
// The tag DB is GitHub Issues (label `gittag`). Each issue body holds a
// ```json fenced block. tag-db.js fetches, regex-extracts, JSON.parses, and
// builds an in-memory namespace tree; search.js scans that map.
//
// This benchmarks the two cost layers separately:
//   1. NETWORK  — the live REST round-trip to the GitHub API
//   2. ENGINE   — parse + buildNS + search/filter, scaled to N synthetic tags
//
// The engine functions are the REAL ones, loaded verbatim from pages/engine/.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

const OWNER = 'teslasolar', REPO = 'GITTAG', LABEL = 'gittag';

// ---- load the real engine into a sandbox ----------------------------------
const sandbox = { fetch, Date, JSON, Object, console };
vm.createContext(sandbox);
for (const f of ['engine/tag-db.js', 'engine/search.js']) {
  vm.runInContext(readFileSync(join(ROOT, 'pages', f), 'utf8'), sandbox, { filename: f });
}

function reset() { sandbox.TAG_DB.tags = {}; sandbox.TAG_DB.ns = {}; }

// ---- timing helpers -------------------------------------------------------
function timeit(fn, iters) {
  // warmup
  for (let i = 0; i < Math.min(iters, 5); i++) fn();
  const samples = [];
  for (let r = 0; r < 7; r++) {
    const t0 = performance.now();
    for (let i = 0; i < iters; i++) fn();
    samples.push((performance.now() - t0) / iters);
  }
  samples.sort((a, b) => a - b);
  return { median: samples[3], min: samples[0], iters };
}
const us = ms => (ms * 1000).toFixed(2) + ' µs';
const ms = v => v.toFixed(2) + ' ms';

// ---- synthetic dataset (shaped like populate.js tags) ---------------------
const UDTS = ['motor', 'valve', 'pid', 'tank', 'vfd', 'analog-in', 'discrete-in'];
const AREAS = ['Line1', 'Line2', 'Utilities', 'TankFarm', 'Pumps'];
function makeIssues(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const udt = UDTS[i % UDTS.length], area = AREAS[i % AREAS.length];
    const tag = {
      tag_path: `Plant/${area}/${udt}/T${i}`, udt_type: udt,
      DisplayName: `${udt} unit ${i}`, value: Math.random() * 100,
      Running: i % 2 === 0, Amps: 12.4, Speed: 1750,
    };
    out.push({ number: i, title: tag.tag_path, body: '```json\n' + JSON.stringify(tag, null, 2) + '\n```' });
  }
  return out;
}

// Replicate fetchTagDB's parse loop over a pre-fetched array (isolates CPU
// cost from network). Mirrors tag-db.js exactly.
function parseIssues(issues) {
  reset();
  issues.forEach(function (iss) {
    const m = iss.body && iss.body.match(/```json\s*([\s\S]*?)```/);
    if (m) {
      try {
        const tag = JSON.parse(m[1]);
        tag._issue = iss.number; tag._title = iss.title;
        const id = tag.tag_path || tag.tag_id || iss.title;
        sandbox.TAG_DB.tags[id] = tag;
        sandbox.buildNS(id, tag);
      } catch (e) {}
    }
  });
  return Object.keys(sandbox.TAG_DB.tags).length;
}

// ---------------------------------------------------------------------------
console.log('═══════════════════════════════════════════════════════════');
console.log(' GitTAG — Tag Issues DB Benchmark');
console.log('═══════════════════════════════════════════════════════════\n');

// 1) NETWORK: live REST round-trip
console.log('1) NETWORK  (live GitHub REST round-trip)');
const url = `https://api.github.com/repos/${OWNER}/${REPO}/issues?labels=${LABEL}&per_page=100&state=open`;
let netSamples = [], liveCount = 0, status = 0;
for (let i = 0; i < 5; i++) {
  const t0 = performance.now();
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'gittag-bench' } });
    status = r.status;
    const j = await r.json();
    netSamples.push(performance.now() - t0);
    if (Array.isArray(j)) liveCount = j.length;
  } catch (e) { netSamples.push(performance.now() - t0); }
}
netSamples.sort((a, b) => a - b);
console.log(`   endpoint : ${url}`);
console.log(`   status   : ${status}${status === 403 ? '  (unauthenticated / rate-limited)' : ''}`);
console.log(`   live tags: ${liveCount}`);
console.log(`   latency  : median ${ms(netSamples[2])}  min ${ms(netSamples[0])}  max ${ms(netSamples[netSamples.length-1])}`);
console.log('   → one HTTP call dominates DB load; engine work below is negligible by comparison.\n');

// 2) ENGINE: parse + buildNS, scaled
console.log('2) ENGINE — fetchTagDB parse loop (regex + JSON.parse + buildNS)');
console.log('   ' + 'tags'.padStart(7) + ' │ ' + 'total'.padStart(11) + ' │ ' + 'per-tag'.padStart(11));
console.log('   ' + '─'.repeat(7) + '─┼─' + '─'.repeat(11) + '─┼─' + '─'.repeat(11));
const sizes = [4, 100, 1000, 10000];
const datasets = {};
for (const n of sizes) {
  const issues = makeIssues(n);
  datasets[n] = issues;
  const it = n >= 1000 ? 20 : 200;
  const t = timeit(() => parseIssues(issues), it);
  console.log('   ' + String(n).padStart(7) + ' │ ' + ms(t.median).padStart(11) + ' │ ' + us(t.median / n).padStart(11));
}
console.log();

// 3) ENGINE: query ops on a loaded 10k DB
console.log('3) ENGINE — query ops on a 10,000-tag in-memory DB');
parseIssues(datasets[10000]);
const q1 = timeit(() => sandbox.searchTags('motor'), 200);
const q2 = timeit(() => sandbox.searchTags('T9999'), 200);
const q3 = timeit(() => sandbox.filterByType('pid'), 200);
const q4 = timeit(() => sandbox.filterByArea('TankFarm'), 200);
const q5 = timeit(() => sandbox.getTagByPath('Plant/Line1/motor/T0'), 5000);
console.log(`   searchTags("motor")  [broad scan] : ${ms(q1.median)}`);
console.log(`   searchTags("T9999")  [rare term]  : ${ms(q2.median)}`);
console.log(`   filterByType("pid")               : ${ms(q3.median)}`);
console.log(`   filterByArea("TankFarm")          : ${ms(q4.median)}`);
console.log(`   getTagByPath(...)    [hash lookup]: ${us(q5.median)}`);
console.log();

console.log('═══════════════════════════════════════════════════════════');
console.log(' Notes');
console.log('  • search/filter are O(n) full scans of TAG_DB.tags (no index).');
console.log('  • getTagByPath is O(1) — the only indexed access path.');
console.log('  • GitHub REST caps at 100 issues/page; >100 tags needs paging');
console.log('    (fetchTagDB currently fetches one page only).');
console.log('═══════════════════════════════════════════════════════════');
