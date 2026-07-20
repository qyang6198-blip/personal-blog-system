document.addEventListener("DOMContentLoaded", function() { loadTags() });
async function loadTags() {
  var c = document.getElementById("tag-list");
  try {
    var r = await fetch("/api/tags");
    var d = await r.json(); var tags = d.data;
    if (tags.length === 0) { c.innerHTML = '<p class="empty">暂无标签</p>'; return; }
    var html = '<div class="tags-cloud">';
    tags.forEach(function(t) { html += '<a href="/tag.html?name=' + encodeURIComponent(t.name) + '" class="tag-badge ds-badge">' + t.name + ' <span class="tag-count">' + t.article_count + '篇</span></a>'; });
    html += '</div>';
    c.innerHTML = html;
  } catch(e) { c.innerHTML = '<p class="error">加载失败</p>'; console.error(e); }
}
