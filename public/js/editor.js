 var Editor = {}
 Editor.init = function(container) {
   Editor.container = container
   Editor.createToolbar()
   Editor.createSplitPane()
   Editor.createStatusBar()
   Editor.createMediaModal()
   Editor.attachEvents()
   Editor.setStatus("编辑器已就绪", "ready")
 }
 Editor.createToolbar = function() {
   var tb = document.createElement("div"); tb.className = "editor-toolbar"
   var btns = [
     {label:"H2", title:"标题", action:function(){Editor.insertFormatting("## ","")}},
     {label:"B", title:"粗体", action:function(){Editor.insertFormatting("**","**")}},
     {label:"I", title:"斜体", action:function(){Editor.insertFormatting("*","*")}},
     {label:">", title:"引用", action:function(){Editor.insertLinePrefix("> ")}},
     {label:"<>", title:"代码", action:function(){Editor.insertCodeBlock()}},
     {label:"\uD83D\uDD17", title:"链接", action:function(){Editor.insertLink()}},
     {label:"\uD83D\uDDBC", title:"图片", action:function(){Editor.openMediaPicker()}},
     {label:"\u2022", title:"列表", action:function(){Editor.insertLinePrefix("- ")}},
     {label:"1.", title:"有序列表", action:function(){Editor.insertLinePrefix("1. ")}}
   ]
   btns.forEach(function(b){
     var btn = document.createElement("button"); btn.className = "editor-tb-btn"; btn.title = b.title
     btn.textContent = b.label; btn.addEventListener("click", b.action); tb.appendChild(btn)
   })
   Editor.container.parentNode.insertBefore(tb, Editor.container)
   Editor.toolbar = tb
 }
 Editor.createSplitPane = function() {
   var sp = document.createElement("div"); sp.className = "editor-split"
   var lp = document.createElement("div"); lp.className = "editor-pane editor-pane-left"
   var ta = document.createElement("textarea"); ta.id = "edit-content"; ta.className = "editor-textarea"
   ta.placeholder = "在此输入 Markdown..."; lp.appendChild(ta)
   var rp = document.createElement("div"); rp.className = "editor-pane editor-pane-right"
   var pv = document.createElement("div"); pv.id = "editor-preview"; pv.className = "editor-preview"
   pv.innerHTML = "<div class='editor-preview-placeholder'>实时预览将显示在此处</div>"; rp.appendChild(pv)
   sp.appendChild(lp); sp.appendChild(rp); Editor.container.appendChild(sp)
   Editor.textarea = ta; Editor.preview = pv
 }
 Editor.createStatusBar = function() {
   var sb = document.createElement("div"); sb.className = "editor-status-bar"
   sb.id = "editor-status-bar"
   var wc = document.createElement("span"); wc.id = "editor-word-count"; wc.textContent = "字数: 0 | 阅读: <1 分钟"
   var st = document.createElement("span"); st.id = "editor-status-text"; st.className = "editor-status-ready"; st.textContent = "编辑器已就绪"
   sb.appendChild(wc); sb.appendChild(st)
   Editor.container.appendChild(sb)
 }
 Editor.createMediaModal = function() {
   var overlay = document.createElement("div"); overlay.id = "editor-media-overlay"; overlay.className = "editor-media-overlay"; overlay.style.display = "none"
   var modal = document.createElement("div"); modal.className = "editor-media-modal"
   var hdr = document.createElement("div"); hdr.className = "editor-media-header"
   var ht = document.createElement("h3"); ht.textContent = "选择图片"
   var hc = document.createElement("button"); hc.className = "admin-btn admin-btn-sm ds-btn ds-btn-sm"; hc.textContent = "关闭"; hc.addEventListener("click", function(){overlay.style.display="none"})
   hdr.appendChild(ht); hdr.appendChild(hc)
   var grid = document.createElement("div"); grid.id = "editor-media-grid"; grid.className = "editor-media-grid"
   var up = document.createElement("div"); up.className = "editor-media-upload"
   var ub = document.createElement("button"); ub.className = "admin-btn admin-btn-sm ds-btn ds-btn-sm"; ub.id = "editor-media-upload-btn"
   ub.textContent = "上传新图片"
   var us = document.createElement("span"); us.id = "editor-media-upload-status"
   up.appendChild(ub); up.appendChild(us)
   var fi = document.createElement("input"); fi.type = "file"; fi.accept = "image/*"; fi.id = "editor-media-file"; fi.style.display = "none"
   modal.appendChild(hdr); modal.appendChild(up); modal.appendChild(grid); modal.appendChild(fi)
   overlay.appendChild(modal); document.body.appendChild(overlay)
   Editor.mediaOverlay = overlay; Editor.mediaGrid = grid
   ub.addEventListener("click", function(){fi.click()})
   fi.addEventListener("change", function(){
     var file = fi.files[0]; if(!file)return; us.textContent = "上传中..."
     var fd = new FormData(); fd.append("image", file)
     fetch("/api/media/upload", {method:"POST", headers:{"Authorization":"Bearer "+localStorage.getItem("token")}, body:fd})
       .then(function(r){return r.json()}).then(function(d){
         if(d.success){us.textContent = "上传成功"; Editor.loadMediaGrid(); fi.value=""}
         else{us.textContent = d.message || "上传失败"}
       }).catch(function(){us.textContent = "网络错误"})
   })
 }
 Editor.loadMediaGrid = function() {
   Editor.mediaGrid.innerHTML = "<div class='admin-loading'>加载中...</div>"
   fetch("/api/media", {headers:{"Authorization":"Bearer "+localStorage.getItem("token")}})
     .then(function(r){return r.json()}).then(function(d){
       var items = d.data || []
       if(items.length===0){Editor.mediaGrid.innerHTML = "<div class='admin-empty'>暂无图片</div>"; return}
       Editor.mediaGrid.innerHTML = ""
       items.forEach(function(item){
         var el = document.createElement("div"); el.className = "editor-media-item"
         var img = document.createElement("img"); img.src = item.url; img.alt = item.name; img.loading = "lazy"
         el.appendChild(img)
         el.addEventListener("click", function(){
           var md = "![" + item.name + "](" + item.url + ")"
           Editor.insertText(md)
           Editor.mediaOverlay.style.display = "none"
         })
         Editor.mediaGrid.appendChild(el)
       })
     }).catch(function(){Editor.mediaGrid.innerHTML = "<div class='admin-empty'>加载失败</div>"})
 }
 Editor.openMediaPicker = function() {
   Editor.loadMediaGrid(); Editor.mediaOverlay.style.display = "flex"
 }
 Editor.setStatus = function(msg, type) {
   var el = document.getElementById("editor-status-text")
   if(!el)return; el.textContent = msg; el.className = "editor-status-" + (type || "ready")
 }
 Editor.attachEvents = function() {
     Editor.textarea.addEventListener("input", function(){Editor.updatePreview(); Editor.markDirty()})
     Editor.textarea.addEventListener("blur", function(){Editor.setStatus("已保存", "saved")})
 }
 Editor.updatePreview = function() {
   var md = Editor.textarea.value
   if(typeof marked !== "undefined" && marked.parse){Editor.preview.innerHTML = marked.parse(md)}
   else{Editor.preview.innerHTML = "<p>" + md.replace(/\n/g, "<br>") + "</p>"}
   Editor.updateWordCount()
   if(typeof hljs !== "undefined"){Editor.preview.querySelectorAll("pre code").forEach(function(b){hljs.highlightElement(b)})}
 }
 Editor.updateWordCount = function() {
   var el = document.getElementById("editor-word-count")
   if(!el)return; var text = Editor.textarea.value
   var cn = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
   var en = (text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\s]/g, "").match(/\S+/g) || []).length
   var minutes = Math.max(1, Math.round(cn/400 + en/250))
   el.textContent = "字数: " + (cn + en) + " | 阅读: " + minutes + " 分钟"
 }
 Editor.getContent = function() {return Editor.textarea ? Editor.textarea.value : ""}
 Editor.setContent = function(md) {
   if(Editor.textarea){Editor.textarea.value = md; Editor.updatePreview()}
 }
 Editor.clear = function() {
   if(Editor.textarea){Editor.textarea.value = ""; Editor.updatePreview()}
 }
 Editor.insertText = function(text) {
   var ta = Editor.textarea; if(!ta)return
   var start = ta.selectionStart; var end = ta.selectionEnd
   ta.value = ta.value.substring(0, start) + text + ta.value.substring(end)
   ta.selectionStart = ta.selectionEnd = start + text.length; ta.focus(); Editor.updatePreview()
 }
 Editor.insertFormatting = function(before, after) {
   var ta = Editor.textarea; if(!ta)return
   var start = ta.selectionStart; var end = ta.selectionEnd
   var sel = ta.value.substring(start, end) || "文字"
   ta.value = ta.value.substring(0, start) + before + sel + after + ta.value.substring(end)
   ta.selectionStart = start + before.length; ta.selectionEnd = end + before.length + sel.length; ta.focus(); Editor.updatePreview()
 }
 Editor.insertLinePrefix = function(prefix) {
   var ta = Editor.textarea; if(!ta)return
   var start = ta.selectionStart; var lineStart = ta.value.lastIndexOf("\n", start - 1) + 1
   ta.value = ta.value.substring(0, lineStart) + prefix + ta.value.substring(lineStart)
   ta.selectionStart = ta.selectionEnd = start + prefix.length; ta.focus(); Editor.updatePreview()
 }
 Editor.insertCodeBlock = function() {
   var ta = Editor.textarea; if(!ta)return
   var start = ta.selectionStart; var end = ta.selectionEnd
   var sel = ta.value.substring(start, end) || "code"
   var text = "\n```\n" + sel + "\n```\n"
   ta.value = ta.value.substring(0, start) + text + ta.value.substring(end)
   ta.selectionStart = ta.selectionEnd = start + text.length; ta.focus(); Editor.updatePreview()
 }
 Editor.insertLink = function() {
   var ta = Editor.textarea; if(!ta)return
   var start = ta.selectionStart; var end = ta.selectionEnd
   var sel = ta.value.substring(start, end) || "链接文字"
   var text = "[" + sel + "](url)"
   ta.value = ta.value.substring(0, start) + text + ta.value.substring(end)
  ta.selectionStart = end + 1; ta.selectionEnd = end + 1 + "url".length; ta.focus(); Editor.updatePreview()
  }
 
 // Auto-save methods
 Editor.autoSaveTimer = null;
 Editor.isDirty = false;
 Editor.cacheKey = "blog_autosave";
 Editor.currentArticleId = null;
 
 Editor.setEditingId = function(id) {
   Editor.currentArticleId = id;
   Editor.cacheKey = id ? "blog_autosave_" + id : "blog_autosave_new";
   Editor.isDirty = false;
   if (Editor.autoSaveTimer) { clearTimeout(Editor.autoSaveTimer); Editor.autoSaveTimer = null; }
 };
 
 Editor.markDirty = function() {
   if (!Editor.textarea) return;
   Editor.isDirty = true;
   Editor.setStatus("正在编辑", "editing");
   Editor.saveToCache();
   if (Editor.autoSaveTimer) clearTimeout(Editor.autoSaveTimer);
   Editor.autoSaveTimer = setTimeout(function() { Editor.doAutoSave() }, 30000);
 };
 
 Editor.doAutoSave = function() {
   if (!Editor.isDirty) return;
   Editor.setStatus("自动保存中...", "saving");
   if (typeof autoSaveContent === "function") { autoSaveContent(); }
 };
 
 Editor.saveToCache = function() {
   var data = {
     title: (document.getElementById("edit-title") || {}).value || "",
     content: Editor.getContent() || "",
     summary: (document.getElementById("edit-summary") || {}).value || "",
     tags: (document.getElementById("edit-tags") || {}).value || "",
     saved_at: Date.now()
   };
   try { localStorage.setItem(Editor.cacheKey, JSON.stringify(data)); } catch(e) {}
 };
 
 Editor.clearCache = function() {
   Editor.isDirty = false;
   try {
     localStorage.removeItem(Editor.cacheKey);
     localStorage.removeItem("blog_autosave_new");
     for (var i = 0; i < localStorage.length; i++) {
       var key = localStorage.key(i);
       if (key && key.indexOf("blog_autosave_") === 0) { localStorage.removeItem(key); }
     }
   } catch(e) {}
 };
 
 Editor.checkRecovery = function(loadedArticleId, currentContent, updatedAt) {
   var keys = [];
   if (loadedArticleId) keys.push("blog_autosave_" + loadedArticleId);
   keys.push("blog_autosave_new");
   console.log("[Autosave] Checking recovery for article " + loadedArticleId + ", content length=" + (currentContent||"").length);
   for (var i = 0; i < keys.length; i++) {
     try {
       var cached = JSON.parse(localStorage.getItem(keys[i]));
       if (cached && cached.content) {
         console.log("[Autosave] cache time: " + new Date(cached.saved_at).toLocaleString());
         console.log("[Autosave] database time: " + (updatedAt || "unknown"));
         if (currentContent && cached.content === currentContent) {
           console.log("[Autosave] recovery result: skipped - content matches database");
           localStorage.removeItem(keys[i]);
           return null;
         }
         console.log("[Autosave] recovery result: showing recovery dialog");
         return cached;
       }
     } catch(e) {}
   }
   return null;
 };
 
 Editor.showRecoveryDialog = function(cached) {
   var overlay = document.createElement("div");
   overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center";
   var modal = document.createElement("div");
   modal.style.cssText = "background:var(--surface-color);border-radius:12px;padding:24px;width:400px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.3);text-align:center";
   var h = document.createElement("h3"); h.textContent = "发现未保存的草稿"; h.style.margin = "0 0 12px 0"; modal.appendChild(h);
   var p = document.createElement("p"); p.textContent = "上次编辑时间：" + new Date(cached.saved_at).toLocaleString(); p.style.marginBottom = "20px"; p.style.color = "var(--text-secondary)"; modal.appendChild(p);
   var btns = document.createElement("div"); btns.style.cssText = "display:flex;gap:12px;justify-content:center";
   var restore = document.createElement("button"); restore.className = "admin-btn admin-btn-primary"; restore.textContent = "恢复草稿";
   var discard = document.createElement("button"); discard.className = "admin-btn"; discard.textContent = "放弃";
   btns.appendChild(restore); btns.appendChild(discard); modal.appendChild(btns);
   overlay.appendChild(modal); document.body.appendChild(overlay);
   restore.addEventListener("click", function() {
     Editor.setContent(cached.content || "");
     var ti = document.getElementById("edit-title"); if (ti) ti.value = cached.title || "";
     var sm = document.getElementById("edit-summary"); if (sm) sm.value = cached.summary || "";
     var tg = document.getElementById("edit-tags"); if (tg) tg.value = cached.tags || "";
     Editor.markDirty();
     document.body.removeChild(overlay);
   });
   discard.addEventListener("click", function() {
     Editor.clearCache();
     document.body.removeChild(overlay);
   });
 };
