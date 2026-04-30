// tag-db.js — load tags from GitHub Issues (gittag label)
var TAG_DB = { tags:{}, ns:{}, ts:0 };
var TAG_OWNER = 'teslasolar';
var TAG_REPO = 'GITTAG';
var TAG_LABEL = 'gittag';

async function fetchTagDB() {
  try {
    var url = 'https://api.github.com/repos/'+TAG_OWNER+'/'+TAG_REPO+'/issues?labels='+TAG_LABEL+'&per_page=100&state=open';
    var r = await fetch(url);
    var issues = await r.json();
    if (!Array.isArray(issues)) return 0;
    issues.forEach(function(iss) {
      var m = iss.body && iss.body.match(/```json\s*([\s\S]*?)```/);
      if (m) {
        try {
          var tag = JSON.parse(m[1]);
          tag._issue = iss.number;
          tag._title = iss.title;
          var id = tag.tag_path || tag.tag_id || iss.title;
          TAG_DB.tags[id] = tag;
          buildNS(id, tag);
        } catch(e) {}
      }
    });
    TAG_DB.ts = Date.now();
    return Object.keys(TAG_DB.tags).length;
  } catch(e) { return 0; }
}

function buildNS(path, tag) {
  var parts = path.split('/');
  var node = TAG_DB.ns;
  parts.forEach(function(p, i) {
    if (!node[p]) node[p] = { _children:{}, _tags:[] };
    if (i === parts.length - 1) node[p]._tags.push(tag);
    node = node[p]._children;
  });
}

function getTagByPath(path) { return TAG_DB.tags[path] || null; }
function getNamespace() { return TAG_DB.ns; }
