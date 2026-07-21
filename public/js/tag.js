document.addEventListener("DOMContentLoaded",function(){loadTagArticles()});
function getQueryParam(name){return new URLSearchParams(window.location.search).get(name)}
function fmtDate(d){if(!d)return"";var p=d.split(" ")[0].split("-");return p[0]+"年"+parseInt(p[1])+"月"+parseInt(p[2])+"日"}
async function loadTagArticles(){
  var c=document.getElementById("articles");
  var tagName=getQueryParam("name");
  if(!tagName){
    c.innerHTML='<div class="ds-empty tag-page-empty"><div class="ds-empty-icon" style="font-size:48px;margin-bottom:16px">🏷️</div><h3 class="ds-empty-title">缺少标签</h3><p class="ds-empty-desc">请通过标签列表选择一个标签</p></div>';
    document.getElementById("tag-name").textContent="未选择标签";
    document.title="未选择标签 - 青泱的 PathNote";
    return;
  }
  document.getElementById("tag-name").textContent="#"+tagName;
  document.title=tagName+" - 青泱的 PathNote";
  try{
    var r=await fetch("/api/tags/"+encodeURIComponent(tagName)+"/articles");
    var d=await r.json();
    var arts=d.data;
    if(arts.length===0){
      c.innerHTML='<div class="ds-empty tag-page-empty"><div class="ds-empty-icon" style="font-size:48px;margin-bottom:16px">📝</div><h3 class="ds-empty-title">暂无文章</h3><p class="ds-empty-desc">该标签下还没有记录任何文章</p></div>';
      return;
    }
    c.innerHTML=arts.map(function(a){
      var tagsHtml="";
      if(a.tags&&a.tags.length>0){
        tagsHtml='<div class="article-tags">'+a.tags.map(function(t){return'<a href="/tag.html?name='+encodeURIComponent(t)+'" class="tag">#'+t+'</a>'}).join("")+'</div>';
      }
      var catHtml=a.category?'<span class="article-cat">'+a.category.name+'</span>':'';
      return '<div class="ds-card article-card-new tag-article-card"><div class="article-card-top"><div class="article-meta">'+fmtDate(a.created_at)+catHtml+'</div><h3 class="article-title"><a href="/article.html?id='+a.id+'">'+a.title+'</a></h3><p class="article-summary">'+(a.summary||"")+'</p></div><div class="article-card-bottom">'+(a.readingTime?'<span class="reading-time">'+a.readingTime+'</span>':"")+tagsHtml+'</div></div>'
    }).join("");
  }catch(e){
    c.innerHTML='<div class="ds-empty tag-page-empty"><div class="ds-empty-icon" style="font-size:48px;margin-bottom:16px">⚠️</div><h3 class="ds-empty-title">加载失败</h3><p class="ds-empty-desc">请稍后重试</p></div>';
    console.error(e);
  }
}
