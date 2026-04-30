// tree.js — ISA-95 namespace tree in west dock
var selectedPath = '';
var NS_ICONS = { 1:'🏢', 2:'🏭', 3:'📍', 4:'⚙️' };

function renderTree(el) {
  el.innerHTML = '<div class="ph">🏷️ TAG TREE</div>'
    + '<div id="search-box" style="padding:4px 8px"><input class="input" style="width:100%" placeholder="Search tags..." oninput="onSearch(this.value)"></div>'
    + '<div id="tree-content"></div>';
  renderNSTree(document.getElementById('tree-content'), getNamespace(), '', 0);
}

function renderNSTree(el, ns, path, depth) {
  var html = '';
  Object.keys(ns).forEach(function(key) {
    if (key.startsWith('_')) return;
    var node = ns[key];
    var fullPath = path ? path+'/'+key : key;
    var tagCount = node._tags ? node._tags.length : 0;
    var hasChildren = Object.keys(node._children || {}).length > 0;
    var icon = NS_ICONS[depth+1] || '📄';
    var sel = fullPath === selectedPath ? ' on' : '';

    html += '<div class="tree-node'+sel+'" style="--depth:'+depth+'" onclick="selectNode(\''+fullPath+'\')">'
      + '<span class="icon">'+(hasChildren?'▸':'')+'</span>'
      + icon + ' ' + key
      + (tagCount ? ' <span style="color:var(--t2);font-size:6px">('+tagCount+')</span>' : '')
      + '</div>';

    if (hasChildren) {
      var sub = document.createElement('div');
      renderNSTree(sub, node._children, fullPath, depth+1);
      html += sub.innerHTML;
    }
  });
  el.innerHTML = html;
}

function selectNode(path) {
  selectedPath = path;
  renderTree(document.getElementById('west-dock'));
  showTagsForPath(path);
}

function onSearch(q) {
  if (!q) { renderNSTree(document.getElementById('tree-content'), getNamespace(), '', 0); return; }
  var results = searchTags(q);
  var el = document.getElementById('tree-content');
  el.innerHTML = results.map(function(r) {
    return '<div class="tree-node" onclick="selectNode(\''+r.path+'\')">'
      + '🔍 ' + r.path + '</div>';
  }).join('');
}
