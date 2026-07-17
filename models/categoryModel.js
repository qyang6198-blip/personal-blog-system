const db = require("../database/database")

function genSlug(name) { return name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "") || "untitled" }

function createCategory(name) {
  var slug = genSlug(name)
  db.prepare("INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)").run(name, slug)
  return db.prepare("SELECT * FROM categories WHERE name = ?").get(name)
}

function getCategories() {
  return db.prepare("SELECT c.*, COUNT(a.id) AS article_count FROM categories c LEFT JOIN articles a ON c.id = a.category_id GROUP BY c.id ORDER BY c.name").all()
}

function getCategoryBySlug(slug) {
  return db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug.trim())
}

function getArticlesByCategory(slug) {
  return db.prepare("SELECT a.* FROM articles a JOIN categories c ON a.category_id = c.id WHERE c.slug = ? ORDER BY a.created_at DESC").all(slug.trim())
}

function deleteCategory(id) {
  db.prepare("UPDATE articles SET category_id = NULL WHERE category_id = ?").run(id)
  return db.prepare("DELETE FROM categories WHERE id = ?").run(id).changes > 0
}

 function updateCategory(id, name) { var slug = genSlug(name); db.prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?").run(name, slug, id); return db.prepare("SELECT * FROM categories WHERE id = ?").get(id) }
 module.exports = { createCategory, getCategories, getCategoryBySlug, getArticlesByCategory, deleteCategory }
 module.exports = { createCategory, getCategories, getCategoryBySlug, getArticlesByCategory, deleteCategory, updateCategory }
