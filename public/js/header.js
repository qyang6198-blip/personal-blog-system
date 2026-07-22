(function(){
var h=document.getElementById('site-header');
if(!h)return;
h.outerHTML='<header class="site-header"><div class="header-container"><div class="header-left"><div class="header-brand"><a href="/" style="text-decoration:none"><div class="header-title">青泱的 <span class="header-pathnote">PathNote</span></div><div class="header-subtitle">RECORD · LEARN · SHARE</div></a></div></div><nav class="header-nav"><a href="/category.html?slug=shenghuo">随笔</a><a href="/category.html?slug=xuexi">笔记</a><a href="/category.html?slug=jingyan">经验</a><a href="/tags.html">标签</a><button class="header-icon-btn" aria-label="搜索"><i data-lucide="search" style="width:18px;height:18px"></i></button><button id="theme-toggle" class="header-icon-btn" aria-label="Toggle theme"><i data-lucide="moon" style="width:18px;height:18px"></i></button></nav></div></header>';
try{ if(typeof lucide!=='undefined') lucide.createIcons(); }catch(e){}
})();
// === 2. Panel + Overlay ===
(function(){
 var header = document.querySelector('.site-header');
 if(!header) return;
  var panel = null, closeTimer = null, _exitId = 0;
  var CATEGORY_MAP = { '随笔':'shenghuo', '笔记':'xuexi', '经验':'jingyan', '标签':null };
  var tagCache = {};

  var s = document.createElement('style');
  s.textContent = [
    '.he-panel{position:absolute;top:72px;left:0;right:0;width:100%;height:0;overflow:hidden;z-index:999;background:var(--bg-page,#fff);backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);border-bottom:1px solid var(--border,rgba(0,0,0,0.06));transition:height 0.5s cubic-bezier(0.16,1,0.3,1);pointer-events:none}',
    '.he-panel.active{height:400px;pointer-events:auto}',
    '[data-theme=dark] .he-panel{background:var(--bg-page,#0f172a);border-bottom-color:rgba(255,255,255,0.04)}',
    '.he-inner{display:flex;gap:48px;padding:40px 48px;max-width:1200px;margin:0 auto;height:100%;box-sizing:border-box}',
    '.he-tags{display:flex;flex-direction:column;gap:0px}',
    '.he-label{font-size:13px;font-weight:400;color:var(--text-muted,#999);margin-bottom:8px;transition:opacity 0.5s cubic-bezier(0.16,1,0.3,1)}',
    '.he-tag{display:block;font-size:28px;font-weight:800;text-decoration:none;color:var(--text-primary,#111);padding:4px 0;transition:opacity 0.5s cubic-bezier(0.16,1,0.3,1),color 0.2s}',
    '.he-tag:hover{color:var(--accent,#b8944a)}',
    '.page-dim-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:998;background:var(--dim-bg,rgba(0,0,0,0.08));opacity:0;pointer-events:none;transition:opacity 0.5s cubic-bezier(0.16,1,0.3,1);transform:translateZ(0)}',
    '.page-dim-overlay.active{opacity:1}',
    '[data-theme=dark] .page-dim-overlay{--dim-bg:rgba(0,0,0,0.3)}',
    'body.page-dimmed main{filter:blur(8px);transition:filter 0.5s cubic-bezier(0.16,1,0.3,1)}',
  ].join('\n');
  document.head.appendChild(s);

  panel = document.createElement('div');
  panel.className = 'he-panel';
  header.appendChild(panel);

  var dim = document.createElement('div');
  dim.className = 'page-dim-overlay';
  document.body.appendChild(dim);

  var obs = new MutationObserver(function(){
    var a = panel.classList.contains('active');
    dim.classList.toggle('active', a);
    document.body.classList.toggle('page-dimmed', a);
  });
  obs.observe(panel, {attributes:true, attributeFilter:['class']});

  var nav = header.querySelector('.header-nav');
  if(nav){
    nav.addEventListener('mouseover', function(e){
      var a = e.target.closest('a');
      if(!a) return;
      var name = a.textContent.trim();
      var slug = CATEGORY_MAP[name];
      if(slug === undefined) return;
      if(closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
      _exitId++;
      var _anim = !panel.classList.contains('active');
      panel.classList.add('active');
      render(name, tagCache[name]||[], _anim);
      if(!tagCache[name]){
        fetchTags(name, function(tags){
          tagCache[name] = tags;
          render(name, tags, false);
        });
      }
    });
  }

  var _searchBtn = header.querySelector('.search-btn');
  if(_searchBtn){
    _searchBtn.addEventListener('click', function(e){
      e.preventDefault();
      if(closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
      _exitId++;
      panel.classList.add('active');
      panel.innerHTML = '<div class=\"he-inner\"><div class=\"he-tags\"></div></div>';
    });
  }

  header.addEventListener('mouseleave', function(e){
    if(!e.relatedTarget || !e.relatedTarget.closest('.he-panel')) schedHide();
  });

  panel.addEventListener('mouseenter', function(){ if(closeTimer){clearTimeout(closeTimer);closeTimer=null;} });
  panel.addEventListener('mouseleave', function(e){
    if(!e.relatedTarget || !e.relatedTarget.closest('.site-header')) schedHide();
  });

  function render(name, tags, animate){
    var h = '<div class=\"he-inner\"><div class=\"he-label\" style=\"opacity:0\">包含</div><div class=\"he-tags\">';
    for(var i=0;i<tags.length;i++){
      var t = tags[i];
      var n = typeof t === 'string' ? t : t.name;
      h += '<a href=\"/tag.html?slug='+encodeURIComponent(n)+'\" class=\"he-tag\" style=\"opacity:0\">'+n+'</a>';
    }
    h += '</div></div>';
    panel.innerHTML = h;
    if(animate){
      var _items = panel.querySelectorAll('.he-tag, .he-label');
      void panel.offsetWidth;
      _items.forEach(function(el, i){
        el.style.transitionDelay = (i * 80) + 'ms';
        el.style.opacity = '1';
      });
    } else {
      var _oldWrap = panel.querySelector('.he-inner');
      if(_oldWrap){
        _oldWrap.style.position = 'absolute';
        _oldWrap.style.top = '0'; _oldWrap.style.left = '0'; _oldWrap.style.right = '0';
       _oldWrap.style.pointerEvents = 'none';
       var _oItems = _oldWrap.querySelectorAll('.he-tag, .he-label');
        _oItems.forEach(function(el){ el.style.transition='opacity 0.02s ease'; el.style.opacity='0'; });
        _oldWrap.parentNode.insertAdjacentHTML('beforeend', h);
        var _newInner = panel.querySelector('.he-inner:last-child');
        if(_newInner){
          var _nItems = _newInner.querySelectorAll('.he-tag, .he-label');
          void _newInner.offsetWidth;
          _nItems.forEach(function(el){ el.style.transition='opacity 0.02s ease 10ms'; el.style.opacity='1'; });
        }
        setTimeout(function(){
          var _restore = panel.querySelectorAll('.he-tag, .he-label');
          _restore.forEach(function(el){ el.style.transition=''; });
          if(_oldWrap.parentNode) _oldWrap.parentNode.removeChild(_oldWrap);
        }, 30);
      } else {
        panel.innerHTML = h;
        var _i2 = panel.querySelectorAll('.he-tag, .he-label');
        _i2.forEach(function(el){ el.style.opacity='1'; });
      }
    }
  }

  function fetchTags(name, cb){
    var slug = CATEGORY_MAP[name];
    if(slug === null){
      fetch('/api/tags').then(function(r){return r.json()}).then(function(d){
        cb((d.data||[]).slice(0,4));
      }).catch(function(){cb([])});
    } else {
      fetch('/api/articles?category='+slug+'&limit=50').then(function(r){return r.json()}).then(function(d){
        var arts = d.data&&d.data.articles?d.data.articles:[];
        var s = {};
        arts.forEach(function(a){
          var t = a.tags;
          if(typeof t==='string') t.split(',').forEach(function(x){x=x.trim();if(x)s[x]=true});
          else if(Array.isArray(t)) t.forEach(function(x){if(x)s[x]=true});
        });
        cb(Object.keys(s).slice(0,4));
      }).catch(function(){cb([])});
    }
  }

  function schedHide(){
    if(closeTimer) clearTimeout(closeTimer);
    _exitId++;
    var cid = _exitId;
    panel.classList.remove('active');
    var _items = Array.from(panel.querySelectorAll('.he-tag, .he-label'));
    var _len = _items.length;
    _items.forEach(function(el, i){
      var d = (_len - 1 - i) * 80;
      setTimeout(function(){
        if(_exitId !== cid) return;
        el.style.transitionDelay = '0ms';
        el.style.opacity = '0';
      }, d);
    });
    closeTimer = setTimeout(function(){ closeTimer=null; }, _len * 80 + 550);
  }

})();
