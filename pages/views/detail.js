// detail.js — east dock tag properties + provider status
function renderEastDock(el) {
  el.innerHTML = '<div class="ph">⚙️ PROPERTIES</div>'
    + '<div id="tag-props" style="padding:4px 8px;font-size:7.5px;color:var(--t2)">Select a tag</div>'
    + '<div class="ph">📡 PROVIDERS</div>'
    + '<div style="padding:4px 8px">'
    + '<div class="tag-row"><span class="k">GitHub</span><span style="color:var(--ok)">● ONLINE</span></div>'
    + '<div class="tag-row"><span class="k">OPC-UA</span><span style="color:var(--t2)">○ N/A</span></div>'
    + '<div class="tag-row"><span class="k">Ignition</span><span style="color:var(--t2)">○ N/A</span></div>'
    + '</div>'
    + '<div class="ph">📐 UDT TYPES</div>'
    + '<div id="udt-list" style="padding:4px 8px"></div>'
    + '<div class="ph">📊 STATS</div>'
    + '<div id="tag-stats" style="padding:4px 8px"></div>';
  renderUDTList();
  renderStats();
}

function renderUDTList() {
  var el = document.getElementById('udt-list');
  if (!el) return;
  el.innerHTML = Object.keys(TAG_UDTS).map(function(id) {
    return '<div class="tag-row"><span class="k">'+id.split('/').pop()+'</span><span class="v">'+id+'</span></div>';
  }).join('');
}

function renderStats() {
  var el = document.getElementById('tag-stats');
  if (!el) return;
  var tagCount = Object.keys(TAG_DB.tags).length;
  var udtCount = Object.keys(TAG_UDTS).length;
  el.innerHTML = '<div class="tag-row"><span class="k">Tags</span><span class="v">'+tagCount+'</span></div>'
    + '<div class="tag-row"><span class="k">UDTs</span><span class="v">'+udtCount+'</span></div>'
    + '<div class="tag-row"><span class="k">Updated</span><span class="v">'+(TAG_DB.ts?new Date(TAG_DB.ts).toLocaleTimeString():'—')+'</span></div>';
}
