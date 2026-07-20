 // == Category Management ==
 (function(){
   function injectNav(){
     var nav=document.getElementById("admin-nav");if(!nav||document.getElementById("nav-categories"))return
     var a=document.createElement("a");a.id="nav-categories";a.href="#categories";a.dataset.section="categories"
     var s=document.createElement("span");s.textContent="分类管理";a.appendChild(s)
     var logout=document.getElementById("nav-logout");if(logout)nav.insertBefore(a,logout)
     a.addEventListener("click",function(e){e.preventDefault();document.querySelectorAll("#admin-nav a").forEach(function(b){b.classList.remove("active")});a.classList.add("active");openCategoryManager()})
   }
   function openCategoryManager(){
     rmOverlays&&rmOverlays()
     var overlay=document.createElement("div");overlay.className="version-overlay";overlay.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:99998;display:flex;align-items:center;justify-content:center"
     overlay.addEventListener("click",function(e){if(e.target===overlay||e.target.className==="version-overlay"){rmOverlays&&rmOverlays()}})
     var modal=document.createElement("div");modal.style.cssText="background:var(--surface-color);border-radius:12px;padding:24px;width:480px;max-width:90vw;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)"
     var hdr=document.createElement("div");hdr.style.cssText="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"
     var h=document.createElement("h3");h.textContent="分类管理";h.style.margin="0";hdr.appendChild(h)
     var close=document.createElement("button");close.className="admin-btn admin-btn-sm ds-btn ds-btn-sm";close.textContent="关闭";close.addEventListener("click",function(){rmOverlays&&rmOverlays()});hdr.appendChild(close)
     modal.appendChild(hdr)
     var form=document.createElement("div");form.style.cssText="display:flex;gap:8px;margin-bottom:16px"
     var inp=document.createElement("input");inp.className="admin-input ds-input";inp.id="new-cat-name";inp.placeholder="输入分类名称";inp.style.flex="1"
     var btn=document.createElement("button");btn.className="admin-btn admin-btn-primary ds-btn ds-btn-primary";btn.textContent="新建";btn.addEventListener("click",function(){var v=document.getElementById("new-cat-name").value;if(!v)return;btn.disabled=true;btn.textContent="创建中...";fetch("/api/categories",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+localStorage.getItem("token")},body:JSON.stringify({name:v})}).then(function(r){return r.json()}).then(function(d){if(d.success){document.getElementById("new-cat-name").value="";loadCatList()}else{toast(d.message||"创建失败","error")};btn.disabled=false;btn.textContent="新建"}).catch(function(){btn.disabled=false;btn.textContent="新建";toast("网络错误","error")})})
     form.appendChild(inp);form.appendChild(btn);modal.appendChild(form)
     var list=document.createElement("div");list.id="cat-list";list.innerHTML="<div class='admin-loading'>加载中...</div>"
     modal.appendChild(list);overlay.appendChild(modal);document.body.appendChild(overlay)
     loadCatList()
   }
   function loadCatList(){
     var el=document.getElementById("cat-list");if(!el)return
     fetch("/api/categories").then(function(r){return r.json()}).then(function(d){
       if(!d.data||d.data.length===0){el.innerHTML="<div class='admin-empty'>暂无分类</div>";return}
       el.innerHTML=""
       d.data.forEach(function(c){
         var row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-color)"
         var info=document.createElement("div")
         var name=document.createElement("div");name.style.fontWeight="600";name.textContent=c.name;info.appendChild(name)
         var slug=document.createElement("div");slug.style.cssText="font-size:12px;color:var(--text-secondary)";slug.textContent="/"+c.slug+(c.article_count?" ("+c.article_count+"篇)":"");info.appendChild(slug)
         row.appendChild(info)
         var del=document.createElement("button");del.className="admin-btn admin-btn-sm admin-btn-danger ds-btn ds-btn-sm ds-btn-danger";del.textContent="删除";del.addEventListener("click",(function(cid){return function(){if(!confirm("删除分类不会删除文章，确定删除？"))return;fetch("/api/categories/"+cid,{method:"DELETE",headers:{"Authorization":"Bearer "+localStorage.getItem("token")}}).then(function(r){return r.json()}).then(function(d2){if(d2.success){toast("删除成功","success");loadCatList()}else{toast(d2.message||"删除失败","error")}}).catch(function(){toast("网络错误","error")})}})(c.id));row.appendChild(del)
         el.appendChild(row)
       })
     }).catch(function(){el.innerHTML="<div class='admin-empty'>加载失败</div>"})
   }
   setTimeout(function(){injectNav()},500)
 })()
