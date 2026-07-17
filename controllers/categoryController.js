const Category = require("../models/categoryModel")

function getCategories(req, res) {
  res.json({ success: true, data: Category.getCategories() })
}

function getArticlesByCategory(req, res) {
  var slug = req.params.slug
  var cat = Category.getCategoryBySlug(slug)
  if (!cat) return res.json({ success: true, data: [] })
  var articles = Category.getArticlesByCategory(slug)
  articles.forEach(function(a) {
    if (typeof a.tags === "string") a.tags = a.tags.split(",").map(function(t){return t.trim()}).filter(function(t){return t})
    a.category = { id: cat.id, name: cat.name, slug: cat.slug }
  })
  res.json({ success: true, data: articles })
}

 function createCategory(req, res) { var name = req.body.name; if (!name) return res.status(400).json({ success: false, message: '分类名称不能为空' }); res.json({ success: true, data: Category.createCategory(name) }) }
 function updateCategory(req, res) { var id = Number(req.params.id); var name = req.body.name; if (!id || !name) return res.status(400).json({ success: false, message: '参数错误' }); var cat = Category.updateCategory(id, name); if (!cat) return res.status(404).json({ success: false, message: '分类不存在' }); res.json({ success: true, data: cat }) }
 function deleteCategory(req, res) { var id = Number(req.params.id); if (!id) return res.status(400).json({ success: false, message: '缺少ID' }); if (!Category.deleteCategory(id)) return res.status(404).json({ success: false, message: '分类不存在' }); res.json({ success: true, data: { message: '删除成功' } }) }
 module.exports = { getCategories, getArticlesByCategory }
 module.exports = { getCategories, getArticlesByCategory, createCategory, updateCategory, deleteCategory }
