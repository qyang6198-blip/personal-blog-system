document.addEventListener("DOMContentLoaded", function() { loadTagArticles() });
function getQueryParam(name) { return new URLSearchParams(window.location.search).get(name); }
async function loadTagArticles() {
  var c = document.getElementById("articles");
  var tagName = getQueryParam("name");
  if (!tagName) { c.innerHTML = '<p class="error">缺少标签名称</p>'; return; }
  document.getElementById("page-title").textContent = "标签: " + tagName;
  try {
    var r = await fetch("/api/tags/" + encodeURIComponent(tagName) + "/articles");
    var d = await r.json(); var articles = d.data;
    if (articles.length === 0) { c.innerHTML = '<p class="empty">该标签下暂无文章</p>'; return; }
    c.innerHTML = articles.map(function(a) {
      var tagsHtml = "";
      if (a.tags && a.tags.length > 0) tagsHtml = '<div class="article-tags">' + a.tags.map(function(t){return '<a href="/tag.html?name=' + encodeURIComponent(t) + '" class="tag">#' + t + '</a>'}).join("") + '</div>';
      return '<article class="article-card"><h2><a href="/article.html?id=' + a.id + '">' + a.title + '</a></h2><time>' + fmtDate(a.created_at) + '</time><p>' + (a.summary || "") + '</p>' + tagsHtml + '</article>';
    }).join("");
    document.title = tagName + " - 我的博客";
  } catch(e) { c.innerHTML = '<p class="error">加载失败</p>'; console.error(e); }
}
function fmtDate(s) { if (!s) return ""; var p = s.split(" ")[0].split("-"); return p[0] + "年" + parseInt(p[1]) + "月" + parseInt(p[2]) + "日"; }
