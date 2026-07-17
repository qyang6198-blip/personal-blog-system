 // == Article Version History UI ==
 function rmOverlays(){document.querySelectorAll(".version-overlay").forEach(function(el){try{document.body.removeChild(el)}catch(e){}})}
 // Overrides autoSaveContent to use autosave endpoint + snapshot
 function autoSaveContent(){
   var title=document.getElementById("edit-title").value;var content=Editor.getContent()
   if(!title||!content){Editor.setStatus("内容不完整，无法自动保存","error");return}
   var summary=document.getElementById("edit-summary").value;var tags=document.getElementById("edit-tags").value;var editingId=window._editingId
   if(!editingId){Editor.setStatus("请先手动保存以启用自动保存","error");return}
   fetch("/api/articles/"+editingId+"/autosave",{method:"PUT",headers:{"Content-Type":"application/json","Authorization":"Bearer "+localStorage.getItem("token")},body:JSON.stringify({title:title,content:content,summary:summary,tags:tags?tags.split(",").map(function(t){return t.trim()}):[]})}).then(function(r){return r.json()}).then(function(d){
     if(d.success){Editor.isDirty=false;Editor.clearCache();Editor.setStatus("已自动保存 "+new Date().toLocaleTimeString(),"saved")
       fetch("/api/articles/"+editingId+"/versions/snapshot",{method:"POST",headers:{"Authorization":"Bearer "+localStorage.getItem("token")}}).then(function(s){return s.json()}).catch(function(){})}
     else{Editor.setStatus("自动保存失败："+(d.message||"未知错误"),"error")}
   }).catch(function(){Editor.setStatus("自动保存失败：网络错误","error")})
 }
 // == Init version button ==
 function initVersionUI(){
   var btnBar=document.querySelector("#section-editor .editor-actions")
   if(!btnBar||document.getElementById("version-history-btn"))return
   var btn=document.createElement("button");btn.className="admin-btn admin-btn-sm";btn.id="version-history-btn";btn.textContent="版本历史"
   btn.addEventListener("click",function(){openVersionHistory()});btnBar.appendChild(btn)
 }
 // == Open version history ==
 function openVersionHistory(){
   var id=window._editingId;if(!id){toast("请先保存文章","error");return}
   var overlay=document.createElement("div");overlay.className="version-overlay";overlay.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:99998;display:flex;align-items:center;justify-content:center"
   overlay.addEventListener("click",function(e){if(e.target===overlay||e.target.className==="version-overlay"){rmOverlays()}})
   var modal=document.createElement("div");modal.style.cssText="background:var(--surface-color);border-radius:12px;padding:24px;width:640px;max-width:90vw;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)"
   var hdr=document.createElement("div");hdr.style.cssText="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"
   var h=document.createElement("h3");h.textContent="版本历史";h.style.margin="0";hdr.appendChild(h)
   var close=document.createElement("button");close.className="admin-btn admin-btn-sm";close.textContent="关闭";close.addEventListener("click",function(){rmOverlays()});hdr.appendChild(close)
   modal.appendChild(hdr);var list=document.createElement("div");list.id="version-list";list.innerHTML="<div class='admin-loading'>加载中...</div>"
   modal.appendChild(list);overlay.appendChild(modal);rmOverlays();document.body.appendChild(overlay)
   fetch("/api/articles/"+id+"/versions",{headers:{"Authorization":"Bearer "+localStorage.getItem("token")}}).then(function(r){return r.json()}).then(function(d){
     if(!d.success||!d.data||d.data.length===0){list.innerHTML="<div class='admin-empty'>暂无版本记录</div>";return}
     list.innerHTML="";d.data.forEach(function(v){
       var c=document.createElement("div");c.style.cssText="border:1px solid var(--border-color);border-radius:8px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center"
       var info=document.createElement("div");var dt=document.createElement("div");dt.style.fontWeight="600";dt.textContent=v.title||"(无标题)";info.appendChild(dt)
       var ts=document.createElement("div");ts.style.cssText="font-size:12px;color:var(--text-secondary);margin-top:2px";ts.textContent=v.created_at;info.appendChild(ts)
       c.appendChild(info);var acts=document.createElement("div");acts.style.cssText="display:flex;gap:4px"
       var vb=document.createElement("button");vb.className="admin-btn admin-btn-sm";vb.textContent="查看";vb.addEventListener("click",(function(vid){return function(){rmOverlays();viewVersion(vid)}})(v.id));acts.appendChild(vb)
       var rb=document.createElement("button");rb.className="admin-btn admin-btn-sm admin-btn-danger";rb.textContent="恢复";rb.addEventListener("click",(function(vid){return function(){rmOverlays();restoreVersion(vid)}})(v.id));acts.appendChild(rb)
       c.appendChild(acts);list.appendChild(c)
     })
   }).catch(function(){list.innerHTML="<div class='admin-empty'>加载失败</div>"})
 }
 // == View version ==
 function viewVersion(versionId){
   fetch("/api/articles/"+window._editingId+"/versions/"+versionId,{headers:{"Authorization":"Bearer "+localStorage.getItem("token")}}).then(function(r){return r.json()}).then(function(d){
     if(!d.success||!d.data){toast("版本不存在","error");return};var v=d.data
     var overlay=document.createElement("div");overlay.className="version-overlay";overlay.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:99998;display:flex;align-items:center;justify-content:center"
     overlay.addEventListener("click",function(e){if(e.target===overlay||e.target.className==="version-overlay"){rmOverlays()}})
     var modal=document.createElement("div");modal.style.cssText="background:var(--surface-color);border-radius:12px;padding:24px;width:700px;max-width:90vw;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)"
     var hdr=document.createElement("div");hdr.style.cssText="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"
     var h=document.createElement("h3");h.textContent="版本详情 - "+(v.title||"(无标题)");h.style.margin="0";hdr.appendChild(h)
     var close=document.createElement("button");close.className="admin-btn admin-btn-sm";close.textContent="返回列表";close.addEventListener("click",function(){rmOverlays();openVersionHistory()});hdr.appendChild(close)
     modal.appendChild(hdr);var meta=document.createElement("div");meta.style.cssText="font-size:12px;color:var(--text-secondary);margin-bottom:12px"
     meta.textContent="创建时间："+v.created_at;modal.appendChild(meta)
     var preview=document.createElement("div");preview.style.cssText="border:1px solid var(--border-color);border-radius:8px;padding:16px;font-size:15px;line-height:1.7"
     preview.innerHTML=typeof marked!== "undefined"&&marked.parse?marked.parse(v.content||""):"<pre>"+(v.content||"")+"</pre>"
     if(typeof hljs!=="undefined"){preview.querySelectorAll("pre code").forEach(function(b){hljs.highlightElement(b)})}
     modal.appendChild(preview);var actBar=document.createElement("div");actBar.style.cssText="margin-top:12px;text-align:center"
     var rb=document.createElement("button");rb.className="admin-btn admin-btn-primary";rb.textContent="恢复此版本"
     rb.addEventListener("click",function(){rmOverlays();restoreVersion(versionId)});actBar.appendChild(rb)
     modal.appendChild(actBar);overlay.appendChild(modal);rmOverlays();document.body.appendChild(overlay)
   })
 }
 // == Restore version ==
 function restoreVersion(versionId){
   if(!confirm("确定恢复此版本？当前内容将备份为历史版本"))return
   rmOverlays()
   fetch("/api/articles/"+window._editingId+"/versions/"+versionId+"/restore",{method:"POST",headers:{"Authorization":"Bearer "+localStorage.getItem("token")}}).then(function(r){return r.json()}).then(function(d){
     if(d.success){toast("版本恢复成功","success")
       fetch("/api/articles/"+window._editingId,{headers:{"Authorization":"Bearer "+localStorage.getItem("token")}}).then(function(r2){return r2.json()}).then(function(d2){
         var a=d2.data||d2;document.getElementById("edit-title").value=a.title||"";document.getElementById("edit-summary").value=a.summary||"";document.getElementById("edit-tags").value=a.tags?a.tags.join(", "):""
         Editor.setContent(a.content||"");Editor.markDirty()
       })
     }else{toast("版本恢复失败","error")}
   }).catch(function(){toast("版本恢复失败：网络错误","error")})
 }
 // == Override editArticle: pass article content to checkRecovery ==
 function editArticle(id){window._editingId=id;Editor.setEditingId(id);navigate("editor");document.getElementById("save-article").textContent="保存修改";fetch("/api/articles/"+id,{headers:{"Authorization":"Bearer "+localStorage.getItem("token")}}).then(function(r){return r.json()}).then(function(d){var a=d.data||d;document.getElementById("edit-title").value=a.title||"";document.getElementById("edit-summary").value=a.summary||"";document.getElementById("edit-tags").value=a.tags?a.tags.join(", "):"";Editor.setContent(a.content||"");var cached=Editor.checkRecovery(id, a.content || "", a.created_at || "");if(cached){Editor.showRecoveryDialog(cached)}})}
 // == Override clearEditor: also clear localStorage cache ==
 function clearEditor(){["edit-title","edit-summary","edit-tags"].forEach(function(id){var el=document.getElementById(id);if(el)el.value=""});Editor.clear();Editor.clearCache();document.getElementById("save-article").textContent="发布文章"}
 // == Auto-init version button ==
 setInterval(function(){var sec=document.getElementById("section-editor");if(sec&&sec.classList.contains("active")){initVersionUI()}},1000)
