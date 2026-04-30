// branch-db.js — create/switch tag DB branches, each with its own issue set
var CURRENT_BRANCH = 'master';

async function createTagBranch(name, description) {
  var token = getGHToken();
  if (!token) return { ok:false, error:'no gh_token in localStorage' };
  var base = 'https://api.github.com/repos/'+TAG_OWNER+'/'+TAG_REPO;
  var master = await fetchJSON(base+'/git/ref/heads/master');
  if (!master) return { ok:false, error:'cannot read master ref' };
  var sha = master.object.sha;
  var r = await fetch(base+'/git/refs', {
    method:'POST',
    headers:{ 'Authorization':'token '+token, 'Content-Type':'application/json' },
    body:JSON.stringify({ ref:'refs/heads/'+name, sha:sha })
  });
  if (!r.ok) return { ok:false, error:'branch create failed: '+(await r.text()) };
  await createBranchMeta(name, description, token);
  return { ok:true, branch:name, sha:sha };
}

async function createBranchMeta(branch, desc, token) {
  var base = 'https://api.github.com/repos/'+TAG_OWNER+'/'+TAG_REPO;
  await fetch(base+'/issues', {
    method:'POST',
    headers:{ 'Authorization':'token '+token, 'Content-Type':'application/json' },
    body:JSON.stringify({
      title:'_meta:'+branch,
      body:'```json\n'+JSON.stringify({branch:branch,desc:desc,created:new Date().toISOString()},null,2)+'\n```',
      labels:[TAG_LABEL, 'branch:'+branch]
    })
  });
}

async function listTagBranches() {
  var branches = await fetchJSON('https://api.github.com/repos/'+TAG_OWNER+'/'+TAG_REPO+'/branches');
  return Array.isArray(branches) ? branches.map(function(b){return b.name}) : ['master'];
}

function switchBranch(name) {
  CURRENT_BRANCH = name;
  TAG_LABEL = name === 'master' ? 'gittag' : 'branch:'+name;
  TAG_DB.tags = {};
  TAG_DB.ns = {};
}

async function fetchJSON(url) {
  try { var r = await fetch(url); return await r.json(); } catch { return null; }
}
