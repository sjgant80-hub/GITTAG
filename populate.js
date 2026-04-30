#!/usr/bin/env node
// populate.js — create tag DB branches and seed with Rockwell + Ignition tags
const OWNER = 'teslasolar';
const REPO = 'GITTAG';

async function api(path, opts) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const url = 'https://api.github.com/repos/' + OWNER + '/' + REPO + path;
  const r = await fetch(url, {
    ...opts,
    headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json', ...(opts?.headers || {}) },
  });
  return r;
}

async function ensureBranch(name) {
  const master = await (await api('/git/ref/heads/master')).json();
  const r = await api('/git/refs', {
    method: 'POST',
    body: JSON.stringify({ ref: 'refs/heads/' + name, sha: master.object.sha }),
  });
  if (r.ok) console.log('  branch created:', name);
  else console.log('  branch exists or error:', name, r.status);
}

async function ensureLabel(name) {
  const r = await api('/labels', {
    method: 'POST',
    body: JSON.stringify({ name: name, color: '38b5f9' }),
  });
  if (r.ok) console.log('  label created:', name);
}

async function createTag(label, tag) {
  const body = '```json\n' + JSON.stringify(tag, null, 2) + '\n```';
  const r = await api('/issues', {
    method: 'POST',
    body: JSON.stringify({ title: tag.tag_path, body: body, labels: [label] }),
  });
  if (r.ok) console.log('  tag:', tag.tag_path);
  else console.log('  FAIL:', tag.tag_path, r.status);
}

const ROCKWELL_TAGS = [
  { tag_path:'Plant/Line1/Motor/M101', udt_type:'motor', DisplayName:'Conveyor Motor M101', Running:true, Amps:12.4, Speed:1750, Fault:false, HOA:2, RunHours:4280 },
  { tag_path:'Plant/Line1/Motor/M102', udt_type:'motor', DisplayName:'Pump Motor M102', Running:true, Amps:8.7, Speed:3450, Fault:false, HOA:2, RunHours:3150 },
  { tag_path:'Plant/Line1/VFD/VFD101', udt_type:'vfd', DisplayName:'Conveyor VFD', FreqCmd:45.0, FreqFbk:44.8, Running:true, Fault:false },
  { tag_path:'Plant/Line1/Valve/FV101', udt_type:'valve', DisplayName:'Feed Valve FV101', Open:true, Closed:false, Position:100, Fault:false },
  { tag_path:'Plant/Line1/Valve/FV102', udt_type:'valve', DisplayName:'Discharge Valve FV102', Open:false, Closed:true, Position:0, Fault:false },
  { tag_path:'Plant/Line1/PID/TIC101', udt_type:'pid', DisplayName:'Temp Control TIC101', PV:185.2, SP:185.0, Output:42.5, Mode:'AUTO' },
  { tag_path:'Plant/Line1/Tank/TK101', udt_type:'tank', DisplayName:'Feed Tank TK101', Level:72.5, Temp:165.3, Pressure:12.4, HiHi:95, Hi:85, Lo:15, LoLo:5 },
  { tag_path:'Plant/Line1/Tank/TK102', udt_type:'tank', DisplayName:'Product Tank TK102', Level:45.2, Temp:78.1, Pressure:8.2, HiHi:90, Hi:80, Lo:10, LoLo:3 },
  { tag_path:'Plant/Line1/AI/AI_101', udt_type:'analog-in', DisplayName:'Flow Transmitter FT101', value:125.6, eng_unit:'GPM', eng_lo:0, eng_hi:500 },
  { tag_path:'Plant/Line1/DI/DI_101', udt_type:'discrete-in', DisplayName:'High Level Switch LSH101', value:false },
  { tag_path:'Plant/Utilities/Motor/M201', udt_type:'motor', DisplayName:'Cooling Pump M201', Running:true, Amps:15.2, Speed:1780, Fault:false, HOA:2, RunHours:8750 },
  { tag_path:'Plant/Utilities/PID/PIC201', udt_type:'pid', DisplayName:'Pressure Control PIC201', PV:55.0, SP:55.0, Output:38.2, Mode:'AUTO' },
];

const IGNITION_TAGS = [
  { tag_path:'Assway/TankFarm/TK001', udt_type:'tank', DisplayName:'Crude Tank TK-001', Level:82.3, Temp:98.5, Pressure:2.1, HiHi:95, Hi:90, Lo:10, LoLo:5 },
  { tag_path:'Assway/TankFarm/TK002', udt_type:'tank', DisplayName:'Water Tank TK-002', Level:55.0, Temp:72.0, Pressure:1.8, HiHi:95, Hi:85, Lo:15, LoLo:5 },
  { tag_path:'Assway/TankFarm/TK003', udt_type:'tank', DisplayName:'Product Tank TK-003', Level:33.7, Temp:110.2, Pressure:5.5, HiHi:90, Hi:80, Lo:10, LoLo:3 },
  { tag_path:'Assway/Pumps/P001', udt_type:'motor', DisplayName:'Transfer Pump P-001', Running:true, Amps:22.1, Speed:3550, Fault:false, HOA:2, RunHours:12400 },
  { tag_path:'Assway/Pumps/P002', udt_type:'motor', DisplayName:'Recirculation Pump P-002', Running:false, Amps:0, Speed:0, Fault:false, HOA:0, RunHours:8200 },
  { tag_path:'Assway/Valves/XV001', udt_type:'valve', DisplayName:'Inlet Shutoff XV-001', Open:true, Closed:false, Position:100, Fault:false },
  { tag_path:'Assway/Valves/XV002', udt_type:'valve', DisplayName:'Outlet Shutoff XV-002', Open:true, Closed:false, Position:100, Fault:false },
  { tag_path:'Assway/Valves/FCV001', udt_type:'valve', DisplayName:'Flow Control FCV-001', Open:true, Closed:false, Position:65, Fault:false },
  { tag_path:'Assway/Controls/TIC001', udt_type:'pid', DisplayName:'Heater Temp Control', PV:210.5, SP:212.0, Output:78.3, Mode:'AUTO' },
  { tag_path:'Assway/Controls/FIC001', udt_type:'pid', DisplayName:'Flow Control Loop', PV:340.0, SP:350.0, Output:55.2, Mode:'AUTO' },
  { tag_path:'Assway/Controls/LIC001', udt_type:'pid', DisplayName:'Level Control TK-001', PV:82.3, SP:80.0, Output:32.1, Mode:'AUTO' },
  { tag_path:'Assway/Instruments/FT001', udt_type:'analog-in', DisplayName:'Flow Transmitter FT-001', value:342.5, eng_unit:'BPH', eng_lo:0, eng_hi:1000 },
];

async function main() {
  console.log('Creating branches...');
  await ensureBranch('rockwell-demo');
  await ensureBranch('ignition-assway');

  console.log('\nCreating labels...');
  await ensureLabel('branch:rockwell-demo');
  await ensureLabel('branch:ignition-assway');

  console.log('\nPopulating rockwell-demo...');
  for (const t of ROCKWELL_TAGS) await createTag('branch:rockwell-demo', t);

  console.log('\nPopulating ignition-assway...');
  for (const t of IGNITION_TAGS) await createTag('branch:ignition-assway', t);

  console.log('\nDone!');
}

main();
