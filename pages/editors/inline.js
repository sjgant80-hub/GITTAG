// inline.js — inline tag value editors (write back to GitHub Issue)
function editTag(path) {
  var tag = getTagByPath(path);
  if (!tag || !tag._issue) return;
  var val = prompt('New value for ' + path + ':', tag.value || '');
  if (val === null) return;
  tag.value = isNaN(val) ? val : parseFloat(val);
  updateTagIssue(tag);
}

async function updateTagIssue(tag) {
  var body = '```json\n' + JSON.stringify(tag, function(k,v) { return k.startsWith('_') ? undefined : v; }, 2) + '\n```';
  try {
    await fetch('https://api.github.com/repos/'+TAG_OWNER+'/'+TAG_REPO+'/issues/'+tag._issue, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json', 'Authorization':'token '+getGHToken() },
      body: JSON.stringify({ body: body })
    });
  } catch(e) { console.error('tag update failed:', e); }
}

async function createTag(path, udt_type, value) {
  var tag = { tag_path:path, udt_type:udt_type, value:value };
  var body = '```json\n' + JSON.stringify(tag, null, 2) + '\n```';
  try {
    await fetch('https://api.github.com/repos/'+TAG_OWNER+'/'+TAG_REPO+'/issues', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'token '+getGHToken() },
      body: JSON.stringify({ title:path, body:body, labels:[TAG_LABEL] })
    });
  } catch(e) { console.error('tag create failed:', e); }
}

function getGHToken() { return localStorage.getItem('gh_token') || ''; }
