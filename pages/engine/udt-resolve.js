// udt-resolve.js — fetch UDT definitions from GitPLC repo
var TAG_UDTS = {};
var PLC_OWNER = 'teslasolar';
var PLC_REPO = 'GITPLC';

async function fetchUDTs() {
  var dirs = ['core','control','equipment','alarms','io'];
  var count = 0;
  for (var i=0; i<dirs.length; i++) {
    try {
      var url = 'https://api.github.com/repos/'+PLC_OWNER+'/'+PLC_REPO+'/contents/'+dirs[i];
      var r = await fetch(url);
      var files = await r.json();
      if (!Array.isArray(files)) continue;
      for (var j=0; j<files.length; j++) {
        if (!files[j].name.endsWith('.json')) continue;
        var raw = await fetch(files[j].download_url);
        TAG_UDTS[dirs[i]+'/'+files[j].name.replace('.json','')] = await raw.json();
        count++;
      }
    } catch(e) {}
  }
  return count;
}

function resolveUDT(type) {
  return TAG_UDTS['control/'+type] || TAG_UDTS['equipment/'+type] || TAG_UDTS['core/'+type] || null;
}
