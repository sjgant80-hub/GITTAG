// app.js — boot: header → UDTs → tags → tree → overview
(async function() {
  var h = document.getElementById('header');
  h.innerHTML = '<span style="color:var(--ign);font-weight:700;font-size:11px">🏷️ GitTAG</span>'
    +'<span style="color:var(--b);margin:0 6px">│</span>'
    +'<span id="state" style="color:var(--ok);font-size:8px">● BOOT</span>'
    +'<span style="color:var(--b);margin:0 6px">│</span>'
    +'<select id="branch-select" class="btn" style="background:var(--s2);color:var(--ig)" onchange="onBranchSwitch(this.value)"><option>master</option></select>'
    +'<span style="flex:1"></span>'
    +'<span class="btn" onclick="fetchTagDB().then(function(){renderTree(document.getElementById(\'west-dock\'))})">↻ Refresh</span>'
    +'<span class="btn primary" onclick="var p=prompt(\'Tag path:\');if(p)createTag(p,prompt(\'UDT type:\'),prompt(\'Value:\'))">+ New Tag</span>'
    +'<span style="color:var(--b);margin:0 6px">│</span>'
    +'<span id="clock" style="color:var(--t2);font-size:8px"></span>';

  document.getElementById('state').textContent = '● Loading UDTs...';
  var udtCount = await fetchUDTs();

  document.getElementById('state').textContent = '● Loading tags...';
  var tagCount = await fetchTagDB();

  renderTree(document.getElementById('west-dock'));
  renderEastDock(document.getElementById('east-dock'));

  var main = document.getElementById('main-panel');
  if (tagCount) {
    showTagsForPath(Object.keys(TAG_DB.tags)[0] || '');
  } else {
    main.innerHTML = '<div style="text-align:center;padding:40px">'
      +'<h2 style="color:var(--ign)">🏷️ No Tags Yet</h2>'
      +'<p style="color:var(--t2);margin:8px 0">Create a GitHub Issue in <code>'+TAG_OWNER+'/'+TAG_REPO+'</code> with label <code>'+TAG_LABEL+'</code></p>'
      +'<p style="color:var(--t2);font-size:8px">Include a JSON code block: <code>{"tag_path":"Plant/Area1/Motor1","udt_type":"motor","value":0}</code></p></div>';
  }

  document.getElementById('status-bar').innerHTML =
    '<span style="color:var(--ok)">● ONLINE</span>'
    +'<span style="color:var(--b);margin:0 4px">│</span>'
    +'<span style="color:var(--t2)">'+udtCount+' UDTs · '+tagCount+' tags</span>'
    +'<span style="flex:1"></span>'
    +'<span style="color:var(--t2)">GitTAG · ISA-95 · '+TAG_OWNER+'/'+TAG_REPO+'</span>';

  document.getElementById('state').textContent = '● RUN';

  setInterval(async function() { await fetchTagDB(); renderStats(); }, 30000);
  setInterval(function() { document.getElementById('clock').textContent = new Date().toLocaleTimeString(); }, 1000);

  // Load branch list
  var branches = await listTagBranches();
  var sel = document.getElementById('branch-select');
  if (sel) sel.innerHTML = branches.map(function(b){ return '<option'+(b===CURRENT_BRANCH?' selected':'')+'>'+b+'</option>'; }).join('');
})();

async function onBranchSwitch(name) {
  document.getElementById('state').textContent = '● Switching to '+name+'...';
  switchBranch(name);
  var count = await fetchTagDB();
  renderTree(document.getElementById('west-dock'));
  renderEastDock(document.getElementById('east-dock'));
  var main = document.getElementById('main-panel');
  if (count) showTagsForPath(Object.keys(TAG_DB.tags)[0]||'');
  else main.innerHTML = '<div style="text-align:center;padding:40px;color:var(--t2)"><h2>No tags on branch: '+name+'</h2></div>';
  document.getElementById('state').textContent = '● RUN ['+name+']';
}
