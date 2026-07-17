 var db = require('../database/database')
 
 function create(params) {
   db.prepare("INSERT INTO article_versions (article_id, title, content, summary, tags, category_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)").run(params.article_id, params.title, params.content, params.summary || '', params.tags || '', params.category_id || null, params.status || 'draft')
   var count = db.prepare("SELECT COUNT(*) AS c FROM article_versions WHERE article_id = ?").get(params.article_id).c
   if (count > 50) {
     var oldest = db.prepare("SELECT id FROM article_versions WHERE article_id = ? ORDER BY created_at ASC LIMIT 1").get(params.article_id)
     if (oldest) db.prepare("DELETE FROM article_versions WHERE id = ?").run(oldest.id)
   }
 }
 
 function findByArticle(articleId) {
   return db.prepare("SELECT id, article_id, title, summary, status, created_at FROM article_versions WHERE article_id = ? ORDER BY created_at DESC").all(articleId)
 }
 
 function findById(id) {
   return db.prepare("SELECT * FROM article_versions WHERE id = ?").get(id)
 }
 
 function deleteByArticle(articleId) {
   return db.prepare("DELETE FROM article_versions WHERE article_id = ?").run(articleId)
 }
 
 function getLatestVersionTime(articleId) {
   var row = db.prepare("SELECT created_at FROM article_versions WHERE article_id = ? ORDER BY created_at DESC LIMIT 1").get(articleId)
   return row ? row.created_at : null
 }
 
 module.exports = { create, findByArticle, findById, deleteByArticle, getLatestVersionTime }
