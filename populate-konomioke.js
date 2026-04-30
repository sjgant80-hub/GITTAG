#!/usr/bin/env node
const OWNER = 'teslasolar';
const REPO = 'GITTAG';

async function api(p, opts) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  return fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+p, {
    ...opts, headers: { 'Authorization':'token '+token, 'Content-Type':'application/json', ...(opts?.headers||{}) },
  });
}

async function branch(name) {
  const master = await (await api('/git/ref/heads/master')).json();
  const r = await api('/git/refs', { method:'POST', body:JSON.stringify({ ref:'refs/heads/'+name, sha:master.object.sha }) });
  console.log(r.ok ? '  ✓ branch' : '  · exists');
}

async function label(name, color) { await api('/labels', { method:'POST', body:JSON.stringify({ name, color }) }); }

async function tag(lbl, t) {
  const body = '```json\n'+JSON.stringify(t,null,2)+'\n```';
  const r = await api('/issues', { method:'POST', body:JSON.stringify({ title:t.tag_path, body, labels:[lbl] }) });
  process.stdout.write(r.ok ? '.' : 'x');
}

const TAGS = [
  { tag_path:'Konomioke/Room/Main', udt_type:'room', room_id:'main-stage', peer_count:4, state:'SINGING', track:'bohemian-rhapsody' },
  { tag_path:'Konomioke/Room/Lounge', udt_type:'room', room_id:'chill-lounge', peer_count:2, state:'LOBBY', track:'' },
  { tag_path:'Konomioke/Voice/Thomas', udt_type:'voice-stream', peer_id:'thomas', active:true, muted:false, volume_db:-12, latency_ms:45 },
  { tag_path:'Konomioke/Voice/Teresa', udt_type:'voice-stream', peer_id:'teresa', active:true, muted:false, volume_db:-15, latency_ms:38 },
  { tag_path:'Konomioke/Voice/Guest1', udt_type:'voice-stream', peer_id:'guest-1', active:true, muted:true, volume_db:-60, latency_ms:120 },
  { tag_path:'Konomioke/Fabric/Room1', udt_type:'audio-fabric', phoneme:'ah', vagal_branch:'ventral', coherence:0.82, hz:440.0 },
  { tag_path:'Konomioke/Vocal/Thomas', udt_type:'vocal-processor', pitch_hz:220.0, pitch_note:'A3', harmony_enabled:true, reverb:0.3 },
  { tag_path:'Konomioke/Vocal/Teresa', udt_type:'vocal-processor', pitch_hz:440.0, pitch_note:'A4', harmony_enabled:true, reverb:0.4 },
  { tag_path:'Konomioke/Track/Now', udt_type:'track-engine', track_id:'bohemian-rhapsody', title:'Bohemian Rhapsody', artist:'Queen', duration_ms:354000, position_ms:120000, state:'PLAYING' },
  { tag_path:'Konomioke/Track/Queue/1', udt_type:'track-engine', track_id:'dont-stop', title:"Don't Stop Me Now", artist:'Queen', state:'IDLE' },
  { tag_path:'Konomioke/Viz/Orb', udt_type:'visualizer', mode:'ORB', orb_radius:1.0, particle_count:127, fps:60, bloom_intensity:0.82 },
  { tag_path:'Konomioke/Bloom/State', udt_type:'bloom-state', ring_2:0.9, ring_3:0.85, ring_5:0.82, ring_7:0.78, ring_11:0.75, ring_13:0.88, ring_17:1.0, coherence:0.82 },
];

async function main() {
  console.log('═══ GitTAG · Konomioke ═══\n');
  await branch('konomioke');
  await label('branch:konomioke', 'a080ff');
  console.log('Seeding tags...');
  for (const t of TAGS) await tag('branch:konomioke', t);
  console.log('\n═══ Done! '+TAGS.length+' tags ═══');
}

main();
