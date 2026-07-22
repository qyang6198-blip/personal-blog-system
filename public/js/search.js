document.addEventListener("DOMContentLoaded",function(){
  var kw=new URLSearchParams(window.location.search).get("q");
  var titleEl=document.getElementById("search-title");
  var heroTitle=document.querySelector(".tag-title");
  if(!kw){
    if(titleEl) titleEl.textContent="搜索结果";
    if(heroTitle) heroTitle.textContent="搜索";
    return;
  }
  var sq=document.getElementById("sq");
  if(sq) sq.value=kw;
  if(titleEl) titleEl.textContent="搜索结果: \""+kw+"\"";
  if(heroTitle) heroTitle.textContent="搜索: "+kw;
  document.title=kw+" - 搜索 - 青泱的PathNote";
  loadSearch(kw);
});
async function loadSearch(kw){
  var c=document.getElementById("search-results");
  try{
    var r=await fetch("/api/search?q="+encodeURIComponent(kw));
    var d=await r.json();
    var arts=d.data.articles;
    if(arts.length===0){
      c.innerHTML='<div class="ds-empty" style="padding:60px 0;text-align:center"><h3 style="font-size:18px;font-weight:600;color:var(--text-primary);margin:0 0 8px">未找到相关文章</h3><p style="font-size:14px;color:var(--text-muted);margin:0">请尝试其他关键词</p></div>';
      return;
    }
    c.innerHTML=arts.map(function(a){
      var tagsHtml="";
      if(a.tags&&a.tags.length>0) tagsHtml='<div class="article-tags">'+a.tags.map(function(t){return'<a href="/tag.html?name='+encodeURIComponent(t)+'" class="tag">#'+t+"</a>"}).join("")+"</div>";
      var catHtml=a.category?'<span class="article-cat">'+a.category.name+"</span>":"";
      return '<div class="ds-card article-card-new"><div class="article-card-top"><div class="article-meta">'+fmt(a.created_at)+catHtml+'</div><h3 class="article-title"><a href="/article.html?id='+a.id+'">'+hl(a.title,kw)+'</a></h3><p class="article-summary">'+(a.summary||"")+'</p></div><div class="article-card-bottom">'+(a.readingTime?'<span class="reading-time">'+a.readingTime+'</span>':"")+tagsHtml+'</div></div>'
    }).join("");
  }catch(e){
    c.innerHTML='<div class="ds-empty" style="padding:60px 0;text-align:center"><h3 style="font-size:18px;font-weight:600;color:var(--text-primary);margin:0 0 8px">搜索失败</h3><p style="font-size:14px;color:var(--text-muted);margin:0">请稍后重试</p></div>';
  }
}
function hl(t,kw){if(!t||!kw)return esc(t||"");var e=esc(t);return e.replace(new RegExp("("+escR(kw)+")","gi"),"<mark>$1</mark>")}
function esc(s){var d=document.createElement("div");d.appendChild(document.createTextNode(s));return d.innerHTML}
function escR(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function fmt(s){if(!s)return "";var p=s.split(" ")[0].split("-");return p[0]+"年"+parseInt(p[1])+"月"+parseInt(p[2])+"日"}