// search.js — tag search + filter
function searchTags(query) {
  var q = query.toLowerCase();
  var results = [];
  Object.keys(TAG_DB.tags).forEach(function(path) {
    var tag = TAG_DB.tags[path];
    var match = path.toLowerCase().includes(q)
      || (tag.udt_type || '').toLowerCase().includes(q)
      || (tag.desc || '').toLowerCase().includes(q)
      || (tag._title || '').toLowerCase().includes(q);
    if (match) results.push({ path:path, tag:tag });
  });
  return results;
}

function filterByType(type) {
  return Object.keys(TAG_DB.tags).filter(function(p) {
    return TAG_DB.tags[p].udt_type === type;
  }).map(function(p) { return { path:p, tag:TAG_DB.tags[p] }; });
}

function filterByArea(area) {
  return Object.keys(TAG_DB.tags).filter(function(p) {
    return p.split('/').indexOf(area) >= 0;
  }).map(function(p) { return { path:p, tag:TAG_DB.tags[p] }; });
}
