const db = require('../database/database')

function createTag(name) {
  db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(name.trim())
  return db.prepare('SELECT id FROM tags WHERE name = ?').get(name.trim()).id
}

function getTagByName(name) {
  return db.prepare('SELECT * FROM tags WHERE name = ?').get(name.trim())
}

function getAllTags() {
  return db.prepare('SELECT t.*, COUNT(at.article_id) AS article_count FROM tags t LEFT JOIN article_tags at ON t.id = at.tag_id GROUP BY t.id ORDER BY t.name').all()
}

function saveArticleTags(articleId, tags) {
  db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId)
  if (!tags || !Array.isArray(tags) || tags.length === 0) return
  tags.forEach(function(name) {
    if (!name || !name.trim()) return
    name = name.trim()
    var tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(name)
    if (!tag) {
      db.prepare('INSERT INTO tags (name) VALUES (?)').run(name)
      tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(name)
    }
    db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(articleId, tag.id)
  })
}

function getArticleTags(articleId) {
  return db.prepare('SELECT t.name FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = ? ORDER BY t.name').all(articleId)
}

function getArticlesByTag(tagName) {
  return db.prepare('SELECT a.* FROM articles a JOIN article_tags at ON a.id = at.article_id JOIN tags t ON t.id = at.tag_id WHERE t.name = ? ORDER BY a.created_at DESC').all(tagName.trim())
}

module.exports = { createTag, getTagByName, getAllTags, saveArticleTags, getArticleTags, getArticlesByTag }
