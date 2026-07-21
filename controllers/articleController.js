var cache = require("../utils/cache")
const readingTime = require('../utils/articleUtils')

// ? tags ??????????????
function formatArticleTags(article) {
  if (!article) return article
  if (typeof article.tags === "string") {
    article.tags = article.tags.split(",").map(function(t){return t.trim()}).filter(function(t){return t})
  }
  if (article.category_id) {
    article.category = Article.getArticleCategory(article.id)
  }
  return article
}

function getArticles(req, res) {
  var cacheKey = "articles:" + req.query.page + ":" + req.query.limit + ":" + req.query.status
  if (req.query.category) {
    cacheKey += ":" + req.query.category
  }
  var cached = cache.get(cacheKey)
  if (cached) { return res.json({ success: true, data: cached }) }
  var page = Number(req.query.page) || 1
  var limit = Number(req.query.limit) || 10

  var authHeader = req.headers.authorization
  var isAdmin = false
  if (authHeader && authHeader.indexOf("Bearer ") === 0) {
    var token = authHeader.split(" ")[1]
    if (authController.verifyToken(token)) {
      isAdmin = true
    }
  }

  var status = "published"
  if (isAdmin && req.query.status) {
    status = req.query.status
  }
  var category = req.query.category || null
  console.log("controller category =", category)

  var result = Article.getArticlesPaginated({ page: page, limit: limit, status: status, category: category })
    if (result.articles) result.articles.forEach(function(a){formatArticleTags(a); if(a.category_id){a.category=Article.getArticleCategory(a.id)}})
  cache.set(cacheKey, result)
  res.json({ success: true, data: result })
}

// 文章控制器模块
//
// 职责：
//   接收路由传来的请求，调用 Model 层读写数据库，返回响应给前端。
//
// 控制器的典型处理流程：
//   1. 从请求中提取参数（req.params / req.body）
//   2. 调用 Model 层函数处理数据
//   3. 根据结果返回 HTTP 响应（JSON）

 var Version = require('../models/versionModel')
 const authController = require('./authController')
const Article = require('../models/articleModel')
const db = require('../database/database')
const Search = require('../models/searchModel')

/**
 * 获取所有文章
 * 请求：GET /api/articles
 * 返回：文章数组 JSON
 */


/**
 * 获取单篇文章
 * 请求：GET /api/articles/:id
 * 参数：URL 中的 :id，例如 /api/articles/3
 * 返回：文章对象，或 404
 */
function getArticle(req, res) {
  // req.params.id 来自 URL 路径中的 :id
  const id = Number(req.params.id)
  const article = Article.getArticleById(id)

  // 如果没找到，返回 404
  if (!article) {
    return res.status(404).json({ success: false, message: '文章不存在' })
  }
  formatArticleTags(article)

  // 游客不能查看草稿
  if (article.status === 'draft') {
    var authHeader = req.headers.authorization
    var isAdmin = false
    if (authHeader && authHeader.startsWith('Bearer ')) {
      var token = authHeader.split(' ')[1]
      if (authController.verifyToken(token)) {
        isAdmin = true
      }
    }
    if (!isAdmin) {
      return res.status(404).json({ success: false, message: '文章不存在' })
    }
  }

  // 添加阅读时间估算
  article.readingTime = readingTime.calculateReadingTime(article.content)

  res.json({ success: true, data: article })
}

/**
 * 创建新文章
 * 请求：POST /api/articles
 * 参数：请求体 JSON { title, content, summary, tags }
 * 返回：201 + 新文章 ID
 */
function createArticle(req, res) {
  cache.clearByPrefix("articles:")
  cache.clearByPrefix("tags")
  cache.clearByPrefix("categories")
  var title = req.body.title
  var content = req.body.content
  var summary = req.body.summary
  var rawTags = req.body.tags

  if (!title || !content) {
    return res.status(400).json({ success: false, message: '标题和正文不能为空' })
  }

  var tagsStr = Array.isArray(rawTags) ? rawTags.join(',') : (rawTags || '')
  var catId = req.body.category_id ? Number(req.body.category_id) : null
  var id = Article.createArticle({ title: title, content: content, summary: summary, tags: tagsStr })
  // 201 Created 表示资源创建成功
  if (rawTags && Array.isArray(rawTags) && rawTags.length > 0) {
    Article.saveArticleTags(id, rawTags)
  }
  if (catId) {
    db.prepare("UPDATE articles SET category_id = ? WHERE id = ?").run(catId, id)
  }
 Search.indexArticle({ id: id, title: title, content: content, summary: summary || '' })
 Version.create({ article_id: id, title: title, content: content, summary: summary || '', tags: tagsStr, category_id: catId, status: 'draft' })
 res.status(201).json({ success: true, data: { id: id } })
}

/**
 * 删除文章
 * 请求：DELETE /api/articles/:id
 * 参数：URL 中的 :id
 * 返回：200（成功）或 404（没找到）
 */
function deleteArticle(req, res) {
  cache.clearByPrefix("articles:")
  cache.clearByPrefix("tags")
  cache.clearByPrefix("search:")
  const id = Number(req.params.id)
  Search.removeArticle(id)
  var deleted = Article.deleteArticle(id)

  if (!deleted) {
    return res.status(404).json({ success: false, message: '文章不存在' })
  }

  res.json({ success: true, data: { message: '删除成功' } })
}


/**
 * ????
 * ???PUT /api/articles/:id
 * ???URL ?? :id + ??? { title, content, summary, tags }
 * ???200 + { success: true, data: { id } } ? 404
 */
function updateArticle(req, res, next) {
  cache.clearByPrefix("articles:")
  cache.clearByPrefix("tags")
  cache.clearByPrefix("categories")
  var id = Number(req.params.id)
  var title = req.body.title
  var content = req.body.content
  var summary = req.body.summary
  var tagsInput = req.body.tags

  if (!title || !content) {
    return res.status(400).json({ success: false, message: "标题和正文不能为空" })
  }

  var tagsStr = Array.isArray(tagsInput) ? tagsInput.join(',') : (tagsInput || '')

  try {
    var catId = req.body.category_id ? Number(req.body.category_id) : null
    var updated = Article.updateArticle(id, { title: title, content: content, summary: summary, tags: tagsStr })
    if (!updated) {
      return res.status(404).json({ success: false, message: "文章不存在" })
    }
    if (tagsInput && Array.isArray(tagsInput) && tagsInput.length > 0) {
      Article.saveArticleTags(id, tagsInput)
    }
    if (catId !== null) {
      db.prepare("UPDATE articles SET category_id = ? WHERE id = ?").run(catId, id)
    } else if (req.body.category_id === null) {
      db.prepare("UPDATE articles SET category_id = NULL WHERE id = ?").run(id)
    }
   Search.indexArticle({ id: id, title: title, content: content, summary: summary || '' })
   Version.create({ article_id: id, title: title, content: content, summary: summary || '', tags: tagsStr, category_id: catId, status: 'draft' })
   res.json({ success: true, data: { id: id } })
  } catch (err) {
    next(err)
  }
}

/**
 * 发布文章
 * 请求：POST /api/articles/:id/publish
 */
function publishArticle(req, res, next) {
  var id = Number(req.params.id)
  try {
    var ok = Article.updateArticleStatus(id, "published")
   if (!ok) return res.status(404).json({ success: false, message: "文章不存在" })
   var art = Article.getArticleById(id); Version.create({ article_id: id, title: art.title, content: art.content, summary: art.summary || '', tags: typeof art.tags === 'string' ? art.tags : (Array.isArray(art.tags) ? art.tags.join(',') : ''), category_id: art.category_id, status: 'published' })
   res.json({ success: true, data: { status: "published" } })
  } catch (err) { next(err) }
}

/**
 * 下架文章（迂回草稿）
 * 请求：POST /api/articles/:id/draft
 */
function draftArticle(req, res, next) {
  var id = Number(req.params.id)
  try {
    var ok = Article.updateArticleStatus(id, "draft")
    if (!ok) return res.status(404).json({ success: false, message: "文章不存在" })
    res.json({ success: true, data: { status: "draft" } })
  } catch (err) { next(err) }
}
 function autoSaveArticle(req, res, next) {
   var id = Number(req.params.id)
   var title = req.body.title; var content = req.body.content; var summary = req.body.summary; var tagsInput = req.body.tags
   if (!title || !content) { return res.status(400).json({ success: false, message: "标题和正文不能为空" }) }
   var tagsStr = Array.isArray(tagsInput) ? tagsInput.join(',') : (tagsInput || '')
   try {
     var catId = req.body.category_id ? Number(req.body.category_id) : null
     if (!Article.updateArticle(id, { title: title, content: content, summary: summary, tags: tagsStr })) { return res.status(404).json({ success: false, message: "文章不存在" }) }
     if (tagsInput && Array.isArray(tagsInput) && tagsInput.length > 0) { Article.saveArticleTags(id, tagsInput) }
     if (catId !== null) { db.prepare("UPDATE articles SET category_id = ? WHERE id = ?").run(catId, id) } else if (req.body.category_id === null) { db.prepare("UPDATE articles SET category_id = NULL WHERE id = ?").run(id) }
     Search.indexArticle({ id: id, title: title, content: content, summary: summary || '' })
     res.json({ success: true, data: { id: id } })
   } catch (err) { next(err) }
 }
 module.exports = {
   getArticles,
   getArticle,
   createArticle,
   deleteArticle,
   updateArticle,
   publishArticle,
   draftArticle,
   autoSaveArticle
 }
