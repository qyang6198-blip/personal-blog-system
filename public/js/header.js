(function(){
var h=document.getElementById('site-header');
if(!h)return;
h.outerHTML='<header class="site-header"><div class="header-container"><div class="header-left"><div class="header-brand"><a href="/" style="text-decoration:none"><div class="header-title">青泱的 <span class="header-pathnote">PathNote</span></div><div class="header-subtitle">RECORD · LEARN · SHARE</div></a></div></div><nav class="header-nav"><a href="/category.html?slug=shenghuo">随笔</a><a href="/category.html?slug=xuexi">笔记</a><a href="/category.html?slug=jingyan">经验</a><a href="/tags.html">标签</a><button class="header-icon-btn" aria-label="搜索"><i data-lucide="search" style="width:18px;height:18px"></i></button><button id="theme-toggle" class="header-icon-btn" aria-label="Toggle theme"><i data-lucide="moon" style="width:18px;height:18px"></i></button></nav></div></header>';
if(typeof lucide!=='undefined')lucide.createIcons()
})()