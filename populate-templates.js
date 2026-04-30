#!/usr/bin/env node
// populate-templates.js — seed template tag DBs for common industries
const OWNER = 'teslasolar';
const REPO = 'GITTAG';

async function api(path, opts) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const r = await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+path, {
    ...opts,
    headers: { 'Authorization':'token '+token, 'Content-Type':'application/json', ...(opts?.headers||{}) },
  });
  return r;
}

async function branch(name) {
  const master = await (await api('/git/ref/heads/master')).json();
  const r = await api('/git/refs', { method:'POST', body:JSON.stringify({ ref:'refs/heads/'+name, sha:master.object.sha }) });
  console.log(r.ok ? '  ✓ branch: '+name : '  · branch exists: '+name);
}

async function label(name, color) {
  await api('/labels', { method:'POST', body:JSON.stringify({ name:name, color:color||'38b5f9' }) });
}

async function tag(lbl, t) {
  const body = '```json\n'+JSON.stringify(t,null,2)+'\n```';
  const r = await api('/issues', { method:'POST', body:JSON.stringify({ title:t.tag_path, body:body, labels:[lbl] }) });
  process.stdout.write(r.ok ? '.' : 'x');
}

async function seed(name, color, tags) {
  console.log('\n🏷️  '+name);
  await branch(name);
  await label('branch:'+name, color);
  for (const t of tags) await tag('branch:'+name, t);
  console.log(' ('+tags.length+' tags)');
}

// ═══════════════════════════════════════════════
// TEMPLATE TAG DATABASES
// ═══════════════════════════════════════════════

const WATER = [
  { tag_path:'WTP/Intake/Pump/P001', udt_type:'motor', DisplayName:'Raw Water Pump P-001', Running:true, Amps:45.2, Speed:1780, HOA:2 },
  { tag_path:'WTP/Intake/Pump/P002', udt_type:'motor', DisplayName:'Raw Water Pump P-002', Running:false, Amps:0, Speed:0, HOA:0 },
  { tag_path:'WTP/Intake/Valve/IV001', udt_type:'valve', DisplayName:'Intake Valve', Open:true, Closed:false, Position:100 },
  { tag_path:'WTP/Clarifier/Motor/M001', udt_type:'motor', DisplayName:'Flocculator Drive', Running:true, Amps:8.5, Speed:12, HOA:2 },
  { tag_path:'WTP/Clarifier/PID/TurbCtrl', udt_type:'pid', DisplayName:'Turbidity Control', PV:0.8, SP:1.0, Output:35.0, Mode:'AUTO' },
  { tag_path:'WTP/Clarifier/Tank/CL001', udt_type:'tank', DisplayName:'Clarifier Basin', Level:85.0, Temp:55.0, Pressure:0 },
  { tag_path:'WTP/Filter/PID/FlowCtrl', udt_type:'pid', DisplayName:'Filter Flow Control', PV:2200, SP:2500, Output:62.0, Mode:'AUTO' },
  { tag_path:'WTP/Filter/AI/DP001', udt_type:'analog-in', DisplayName:'Filter DP', value:4.2, eng_unit:'psi', eng_lo:0, eng_hi:15 },
  { tag_path:'WTP/Disinfection/PID/ClCtrl', udt_type:'pid', DisplayName:'Chlorine Residual', PV:1.8, SP:2.0, Output:45.0, Mode:'AUTO' },
  { tag_path:'WTP/Disinfection/AI/pH001', udt_type:'analog-in', DisplayName:'pH Analyzer', value:7.2, eng_unit:'pH', eng_lo:0, eng_hi:14 },
  { tag_path:'WTP/ClearWell/Tank/CW001', udt_type:'tank', DisplayName:'Clear Well', Level:72.0, Temp:56.0, Pressure:0 },
  { tag_path:'WTP/Distribution/Pump/P101', udt_type:'motor', DisplayName:'Distribution Pump', Running:true, Amps:120, Speed:1780, HOA:2 },
];

const BREWERY = [
  { tag_path:'Brew/MillHouse/Motor/M001', udt_type:'motor', DisplayName:'Malt Mill', Running:true, Amps:15.0, Speed:1750, HOA:2 },
  { tag_path:'Brew/MashTun/Tank/MT001', udt_type:'tank', DisplayName:'Mash Tun', Level:80.0, Temp:152.0, Pressure:0 },
  { tag_path:'Brew/MashTun/PID/TempCtrl', udt_type:'pid', DisplayName:'Mash Temp', PV:152.0, SP:152.0, Output:30.0, Mode:'AUTO' },
  { tag_path:'Brew/LauterTun/Tank/LT001', udt_type:'tank', DisplayName:'Lauter Tun', Level:65.0, Temp:168.0, Pressure:0 },
  { tag_path:'Brew/BoilKettle/Tank/BK001', udt_type:'tank', DisplayName:'Boil Kettle', Level:90.0, Temp:212.0, Pressure:1.2 },
  { tag_path:'Brew/BoilKettle/PID/TempCtrl', udt_type:'pid', DisplayName:'Kettle Temp', PV:212.0, SP:212.0, Output:95.0, Mode:'AUTO' },
  { tag_path:'Brew/Whirlpool/Motor/M002', udt_type:'motor', DisplayName:'Whirlpool Pump', Running:true, Amps:8.0, Speed:3450, HOA:2 },
  { tag_path:'Brew/HeatEx/PID/WortCool', udt_type:'pid', DisplayName:'Wort Cooling', PV:68.0, SP:68.0, Output:50.0, Mode:'AUTO' },
  { tag_path:'Brew/Fermenter/Tank/FV001', udt_type:'tank', DisplayName:'Fermenter #1', Level:95.0, Temp:68.0, Pressure:8.5 },
  { tag_path:'Brew/Fermenter/Tank/FV002', udt_type:'tank', DisplayName:'Fermenter #2', Level:40.0, Temp:34.0, Pressure:12.0 },
  { tag_path:'Brew/Fermenter/PID/TempFV1', udt_type:'pid', DisplayName:'FV1 Temp Control', PV:68.0, SP:68.0, Output:25.0, Mode:'AUTO' },
  { tag_path:'Brew/BrightTank/Tank/BT001', udt_type:'tank', DisplayName:'Bright Tank', Level:70.0, Temp:34.0, Pressure:14.0 },
  { tag_path:'Brew/CIP/Motor/CIPP001', udt_type:'motor', DisplayName:'CIP Pump', Running:false, Amps:0, Speed:0, HOA:0 },
  { tag_path:'Brew/CIP/PID/CIPTemp', udt_type:'pid', DisplayName:'CIP Temp Control', PV:180.0, SP:180.0, Output:0, Mode:'MAN' },
];

const PACKAGING = [
  { tag_path:'Pkg/Filler/Motor/M001', udt_type:'motor', DisplayName:'Filler Drive', Running:true, Amps:12.0, Speed:60, HOA:2 },
  { tag_path:'Pkg/Filler/VFD/VFD001', udt_type:'vfd', DisplayName:'Filler VFD', FreqCmd:30.0, FreqFbk:30.0, Running:true },
  { tag_path:'Pkg/Filler/PID/FillLevel', udt_type:'pid', DisplayName:'Fill Level Control', PV:330, SP:330, Output:48.0, Mode:'AUTO' },
  { tag_path:'Pkg/Capper/Motor/M002', udt_type:'motor', DisplayName:'Capper Drive', Running:true, Amps:5.5, Speed:60, HOA:2 },
  { tag_path:'Pkg/Labeler/Motor/M003', udt_type:'motor', DisplayName:'Labeler Drive', Running:true, Amps:3.2, Speed:60, HOA:2 },
  { tag_path:'Pkg/Conveyor/Motor/M010', udt_type:'motor', DisplayName:'Infeed Conveyor', Running:true, Amps:4.0, Speed:1750, HOA:2 },
  { tag_path:'Pkg/Conveyor/Motor/M011', udt_type:'motor', DisplayName:'Outfeed Conveyor', Running:true, Amps:4.0, Speed:1750, HOA:2 },
  { tag_path:'Pkg/Conveyor/VFD/VFD010', udt_type:'vfd', DisplayName:'Infeed VFD', FreqCmd:45.0, FreqFbk:45.0, Running:true },
  { tag_path:'Pkg/Reject/DI/PhotoEye', udt_type:'discrete-in', DisplayName:'Reject Photo Eye', value:false },
  { tag_path:'Pkg/Reject/DO/Diverter', udt_type:'discrete-out', DisplayName:'Reject Diverter', value:false },
  { tag_path:'Pkg/CasePacker/Motor/M020', udt_type:'motor', DisplayName:'Case Packer', Running:true, Amps:8.0, Speed:30, HOA:2 },
  { tag_path:'Pkg/Palletizer/Motor/M030', udt_type:'motor', DisplayName:'Palletizer', Running:true, Amps:15.0, Speed:8, HOA:2 },
];

const HVAC = [
  { tag_path:'HVAC/AHU1/Motor/SupplyFan', udt_type:'motor', DisplayName:'Supply Fan AHU-1', Running:true, Amps:18.5, Speed:1180, HOA:2 },
  { tag_path:'HVAC/AHU1/Motor/ReturnFan', udt_type:'motor', DisplayName:'Return Fan AHU-1', Running:true, Amps:12.0, Speed:1180, HOA:2 },
  { tag_path:'HVAC/AHU1/VFD/SupplyVFD', udt_type:'vfd', DisplayName:'Supply Fan VFD', FreqCmd:42.0, FreqFbk:42.0, Running:true },
  { tag_path:'HVAC/AHU1/PID/DischargeTemp', udt_type:'pid', DisplayName:'Discharge Air Temp', PV:55.0, SP:55.0, Output:60.0, Mode:'AUTO' },
  { tag_path:'HVAC/AHU1/PID/StaticPress', udt_type:'pid', DisplayName:'Duct Static Pressure', PV:1.5, SP:1.5, Output:70.0, Mode:'AUTO' },
  { tag_path:'HVAC/AHU1/Valve/ChillValve', udt_type:'valve', DisplayName:'Chilled Water Valve', Open:true, Closed:false, Position:60 },
  { tag_path:'HVAC/AHU1/Valve/HotValve', udt_type:'valve', DisplayName:'Hot Water Valve', Open:false, Closed:true, Position:0 },
  { tag_path:'HVAC/Chiller/Motor/Compressor', udt_type:'motor', DisplayName:'Chiller Compressor', Running:true, Amps:85.0, Speed:3560, HOA:2 },
  { tag_path:'HVAC/Chiller/PID/ChWTemp', udt_type:'pid', DisplayName:'Chilled Water Temp', PV:44.0, SP:44.0, Output:65.0, Mode:'AUTO' },
  { tag_path:'HVAC/Boiler/PID/HWTemp', udt_type:'pid', DisplayName:'Hot Water Temp', PV:180.0, SP:180.0, Output:0, Mode:'AUTO' },
  { tag_path:'HVAC/Zones/Zone1/AI/Temp', udt_type:'analog-in', DisplayName:'Zone 1 Temperature', value:72.0, eng_unit:'°F', eng_lo:50, eng_hi:100 },
  { tag_path:'HVAC/Zones/Zone2/AI/Temp', udt_type:'analog-in', DisplayName:'Zone 2 Temperature', value:71.5, eng_unit:'°F', eng_lo:50, eng_hi:100 },
];

const OILGAS = [
  { tag_path:'OG/Wellhead/Valve/MasterValve', udt_type:'valve', DisplayName:'Master Valve WH-001', Open:true, Closed:false, Position:100 },
  { tag_path:'OG/Wellhead/Valve/WingValve', udt_type:'valve', DisplayName:'Wing Valve WH-001', Open:true, Closed:false, Position:100 },
  { tag_path:'OG/Wellhead/AI/WHP', udt_type:'analog-in', DisplayName:'Wellhead Pressure', value:2450, eng_unit:'psi', eng_lo:0, eng_hi:5000 },
  { tag_path:'OG/Wellhead/AI/WHT', udt_type:'analog-in', DisplayName:'Wellhead Temp', value:185, eng_unit:'°F', eng_lo:0, eng_hi:400 },
  { tag_path:'OG/Separator/Tank/V001', udt_type:'tank', DisplayName:'3-Phase Separator', Level:55.0, Temp:120.0, Pressure:850 },
  { tag_path:'OG/Separator/PID/LevelCtrl', udt_type:'pid', DisplayName:'Separator Level', PV:55.0, SP:50.0, Output:42.0, Mode:'AUTO' },
  { tag_path:'OG/Separator/PID/PressCtrl', udt_type:'pid', DisplayName:'Separator Pressure', PV:850, SP:850, Output:55.0, Mode:'AUTO' },
  { tag_path:'OG/Heater/PID/TempCtrl', udt_type:'pid', DisplayName:'Heater Treater Temp', PV:140.0, SP:140.0, Output:60.0, Mode:'AUTO' },
  { tag_path:'OG/Compressor/Motor/C001', udt_type:'motor', DisplayName:'Gas Compressor', Running:true, Amps:250, Speed:1200, HOA:2 },
  { tag_path:'OG/Compressor/AI/DischPress', udt_type:'analog-in', DisplayName:'Compressor Discharge', value:1200, eng_unit:'psi', eng_lo:0, eng_hi:2000 },
  { tag_path:'OG/Storage/Tank/TK001', udt_type:'tank', DisplayName:'Oil Storage Tank', Level:65.0, Temp:85.0, Pressure:0 },
  { tag_path:'OG/LACT/AI/FlowRate', udt_type:'analog-in', DisplayName:'LACT Flow Meter', value:850, eng_unit:'BPD', eng_lo:0, eng_hi:2000 },
  { tag_path:'OG/Flare/AI/FlareFlow', udt_type:'analog-in', DisplayName:'Flare Gas Flow', value:125, eng_unit:'MSCFD', eng_lo:0, eng_hi:1000 },
];

const PHARMA = [
  { tag_path:'Pharma/Reactor/Tank/R001', udt_type:'tank', DisplayName:'Reactor R-001', Level:60.0, Temp:78.5, Pressure:25.0 },
  { tag_path:'Pharma/Reactor/PID/TempCtrl', udt_type:'pid', DisplayName:'Reactor Temp', PV:78.5, SP:78.0, Output:45.0, Mode:'AUTO' },
  { tag_path:'Pharma/Reactor/PID/pHCtrl', udt_type:'pid', DisplayName:'Reactor pH', PV:6.8, SP:7.0, Output:30.0, Mode:'AUTO' },
  { tag_path:'Pharma/Reactor/Motor/Agitator', udt_type:'motor', DisplayName:'Agitator M-001', Running:true, Amps:12.5, Speed:120, HOA:2 },
  { tag_path:'Pharma/CIP/Motor/CIPPump', udt_type:'motor', DisplayName:'CIP Supply Pump', Running:false, Amps:0, Speed:0, HOA:0 },
  { tag_path:'Pharma/CIP/PID/CIPTemp', udt_type:'pid', DisplayName:'CIP Temp', PV:82.0, SP:82.0, Output:0, Mode:'MAN' },
  { tag_path:'Pharma/WFI/PID/WFITemp', udt_type:'pid', DisplayName:'WFI Temp', PV:80.0, SP:80.0, Output:55.0, Mode:'AUTO' },
  { tag_path:'Pharma/WFI/AI/Conductivity', udt_type:'analog-in', DisplayName:'WFI Conductivity', value:0.8, eng_unit:'µS/cm', eng_lo:0, eng_hi:5 },
  { tag_path:'Pharma/WFI/AI/TOC', udt_type:'analog-in', DisplayName:'WFI TOC', value:150, eng_unit:'ppb', eng_lo:0, eng_hi:500 },
  { tag_path:'Pharma/Cleanroom/AI/DiffPress', udt_type:'analog-in', DisplayName:'Room ΔP', value:0.05, eng_unit:'in WC', eng_lo:0, eng_hi:0.1 },
  { tag_path:'Pharma/Cleanroom/AI/Particles', udt_type:'analog-in', DisplayName:'Particle Count', value:2800, eng_unit:'ct/m³', eng_lo:0, eng_hi:100000 },
  { tag_path:'Pharma/Lyophilizer/PID/ShelfTemp', udt_type:'pid', DisplayName:'Lyo Shelf Temp', PV:-40.0, SP:-40.0, Output:80.0, Mode:'AUTO' },
];

async function main() {
  console.log('═══ GitTAG Template Seeder ═══\n');
  await seed('tpl-water-treatment', '38d8b8', WATER);
  await seed('tpl-brewery', 'd4a94a', BREWERY);
  await seed('tpl-packaging', 'f57c20', PACKAGING);
  await seed('tpl-hvac', '38b5f9', HVAC);
  await seed('tpl-oil-gas', 'ff4466', OILGAS);
  await seed('tpl-pharma', 'a080ff', PHARMA);
  console.log('\n═══ Done! 6 templates, '+(WATER.length+BREWERY.length+PACKAGING.length+HVAC.length+OILGAS.length+PHARMA.length)+' tags ═══');
}

main();
