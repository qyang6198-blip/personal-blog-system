const db = require("../database/database")

function searchArticles(keyword) {
  var safe = (keyword || "").trim().substring(0, 50)
  if (!safe) return []
  safe = safe.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, " ").trim()
  if (!safe) return []
  var stmt = db.prepare(
    "SELECT a.* FROM articles a JOIN articles_fts f ON a.id = f.article_id WHERE articles_fts MATCH ? ORDER BY rank"
  )
  return stmt.all(safe + "*")
}

function indexArticle(article) {
  db.prepare("DELETE FROM articles_fts WHERE article_id = ?").run(article.id)
  db.prepare("INSERT INTO articles_fts (title, summary, content, article_id) VALUES (?, ?, ?, ?)")
    .run(article.title, article.summary || "", article.content, article.id)
}

function removeArticle(articleId) {
  db.prepare("DELETE FROM articles_fts WHERE article_id = ?").run(articleId)
}

module.exports = { searchArticles, indexArticle, removeArticle }
