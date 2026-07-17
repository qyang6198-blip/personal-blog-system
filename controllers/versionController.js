 var Version = require('../models/versionModel')
 var Article = require('../models/articleModel')
 var db = require('../database/database')
 
 function getVersions(req, res) {
   var articleId = Number(req.params.id)
   if (!articleId) return res.status(400).json({ success: false, message: '缺少文章ID' })
   var list = Version.findByArticle(articleId)
   res.json({ success: true, data: list.map(function(v) { return { id: v.id, title: v.title, summary: v.summary, status: v.status, created_at: v.created_at } }) })
 }
 
 function getVersion(req, res) {
   var versionId = Number(req.params.versionId)
   if (!versionId) return res.status(400).json({ success: false, message: '缺少版本ID' })
   var version = Version.findById(versionId)
   if (!version) return res.status(404).json({ success: false, message: '版本不存在' })
   res.json({ success: true, data: { id: version.id, title: version.title, content: version.content, summary: version.summary, tags: version.tags, category_id: version.category_id, status: version.status, created_at: version.created_at } })
 }
 
 function restoreVersion(req, res) {
   var articleId = Number(req.params.id)
   var versionId = Number(req.params.versionId)
   if (!articleId || !versionId) return res.status(400).json({ success: false, message: '参数错误' })
   var version = Version.findById(versionId)
   if (!version) return res.status(404).json({ success: false, message: '版本不存在' })
   var article = Article.getArticleById(articleId)
   if (!article) return res.status(404).json({ success: false, message: '文章不存在' })
   Version.create({ article_id: articleId, title: article.title, content: article.content, summary: article.summary, tags: article.tags, category_id: article.category_id, status: article.status })
   Article.updateArticle(articleId, { title: version.title, content: version.content, summary: version.summary, tags: version.tags })
   if (version.category_id) { db.prepare("UPDATE articles SET category_id = ? WHERE id = ?").run(version.category_id, articleId) }
   res.json({ success: true, data: { message: '版本恢复成功' } })
 }
 
 function createSnapshot(req, res) {
   var articleId = Number(req.params.id)
   if (!articleId) return res.status(400).json({ success: false, message: '缺少文章ID' })
   var article = require('../models/articleModel').getArticleById(articleId)
   if (!article) return res.status(404).json({ success: false, message: '文章不存在' })
   var lastTime = Version.getLatestVersionTime(articleId)
   if (lastTime) {
     var diff = Date.now() - new Date(lastTime + 'Z').getTime()
     if (diff < 600000 && !req.body.force) {
       return res.json({ success: true, data: { message: '距离上次版本不足10分钟，跳过', skipped: true } })
     }
   }
   Version.create({ article_id: articleId, title: article.title, content: article.content, summary: article.summary, tags: typeof article.tags === 'string' ? article.tags : (Array.isArray(article.tags) ? article.tags.join(',') : ''), category_id: article.category_id, status: article.status })
   res.json({ success: true, data: { message: '版本已创建' } })
 }
 
 function diffVersions(req, res) {
   var v1 = Number(req.params.v1)
   var v2 = Number(req.params.v2)
   if (!v1 || !v2) return res.status(400).json({ success: false, message: '参数错误' })
   var ver1 = Version.findById(v1)
   var ver2 = Version.findById(v2)
   if (!ver1 || !ver2) return res.status(404).json({ success: false, message: '版本不存在' })
   var lines1 = (ver1.content || '').split('\n')
   var lines2 = (ver2.content || '').split('\n')
   var added = []
   var removed = []
   var maxLen = Math.max(lines1.length, lines2.length)
   for (var i = 0; i < maxLen; i++) {
     if (i >= lines1.length) { added.push({ line: i + 1, text: lines2[i] }); continue }
     if (i >= lines2.length) { removed.push({ line: i + 1, text: lines1[i] }); continue }
     if (lines1[i] !== lines2[i]) { removed.push({ line: i + 1, text: lines1[i] }); added.push({ line: i + 1, text: lines2[i] }) }
   }
   res.json({ success: true, data: { added: added, removed: removed, version1: { id: ver1.id, created_at: ver1.created_at }, version2: { id: ver2.id, created_at: ver2.created_at } } })
 }
 module.exports = { getVersions, getVersion, restoreVersion, createSnapshot, diffVersions }
