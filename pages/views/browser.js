// browser.js — main panel tag browser
function showTagsForPath(path) {
  var main = document.getElementById('main-panel');
  var tag = getTagByPath(path);
  if (tag) { renderTagDetail(main, path, tag); return; }
  var parts = path.split('/');
  var node = getNamespace();
  parts.forEach(function(p) { if (node[p]) node = node[p]._children; });
  renderTagList(main, path, node);
}

function renderTagList(el, path, ns) {
  var tags = [];
  Object.keys(TAG_DB.tags).forEach(function(p) { if (p.startsWith(path)) tags.push({ path:p, tag:TAG_DB.tags[p] }); });
  el.innerHTML = '<h3 style="color:var(--ign);font-size:11px;margin-bottom:8px">📂 '+path+'</h3>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px">'
    + tags.map(function(r) {
      var t = r.tag;
      return '<div class="tag-card" onclick="selectNode(\''+r.path+'\')" style="cursor:pointer">'
        +'<div class="name">'+r.path.split('/').pop()+'</div>'
        +'<div class="type">'+(t.udt_type||'—')+'</div>'
        +'<div class="tag-row"><span class="k">Value</span><span class="v">'+(t.value||'—')+'</span></div>'
        +'</div>';
    }).join('') + '</div>';
}

function renderTagDetail(el, path, tag) {
  var udt = tag.udt_type ? resolveUDT(tag.udt_type) : null;
  el.innerHTML = '<h3 style="color:var(--ig);font-size:11px">🏷️ '+path+'</h3>'
    +'<div class="tag-card">'
    +'<div class="tag-row"><span class="k">Type</span><span class="type">'+(tag.udt_type||'—')+'</span></div>'
    +'<div class="tag-row"><span class="k">Value</span><span class="v">'+(tag.value||'—')+'</span></div>'
    +'<div class="tag-row"><span class="k">Issue</span><span>#'+(tag._issue||'—')+'</span></div>'
    + Object.keys(tag).filter(function(k){return !k.startsWith('_')&&k!=='tag_path'&&k!=='tag_id'&&k!=='udt_type'&&k!=='value'}).map(function(k) {
      return '<div class="tag-row"><span class="k">'+k+'</span><span class="v">'+JSON.stringify(tag[k])+'</span></div>';
    }).join('')
    +'</div>'
    + (udt ? '<h4 style="color:var(--ign);font-size:9px;margin-top:8px">📐 UDT: '+tag.udt_type+'</h4><pre style="font-size:7px;color:var(--t);background:var(--s2);padding:6px;border-radius:3px">'+JSON.stringify(udt,null,2)+'</pre>' : '');
}
