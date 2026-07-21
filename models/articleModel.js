// 文章数据模型
//
// 职责：
//   封装所有对 articles 表的数据库操作。
//   上层（controllers）只调这些函数，不需要写 SQL。
//
// 为什么单独一层：
//   如果以后换数据库或改表结构，只改这个文件，
//   上层代码（路由、控制器）不需要动。
//
// 使用方式：
//   const Article = require('./models/articleModel')
//   const articles = Article.getAllArticles()

const db = require('../database/database')

/**
 * 获取所有文章，按发布时间倒序（最新的排最前）
 *
 * 输入：无
 * 输出：文章数组，每篇包含 id, title, content, summary, tags, created_at
 */
function getAllArticles() {
  // 从 articles 表查询所有列，按 created_at 降序排列
  const stmt = db.prepare(
    'SELECT * FROM articles ORDER BY created_at DESC'
  )
  return stmt.all()
}

/**
 * 根据文章 ID 获取单篇文章
 *
 * 输入：id - 文章的编号
 * 输出：文章对象，如果不存在返回 undefined
 */
function getArticleById(id) {
  // 使用 ? 占位符代替 id，防止 SQL 注入攻击
  // 不要用 ${id} 拼到 SQL 字符串里
  const stmt = db.prepare('SELECT * FROM articles WHERE id = ?')
  return stmt.get(id)
}

/**
 * 创建一篇新文章，返回新文章的 ID
 *
 * 输入：
 *   article 对象，包含：
 *     title   - 文章标题（必填）
 *     content - 文章正文（必填）
 *     summary - 文章摘要（选填）
 *     tags    - 标签（选填，用逗号分隔的字符串）
 * 输出：新插入行的 ID（lastInsertRowid）
 */
function createArticle(article) {
  // 从参数对象中解构出四个字段
  // 给 summary 和 tags 提供空字符串作为默认值
  const { title, content, summary = '', tags = '' } = article

  const stmt = db.prepare(
    `INSERT INTO articles (title, content, summary, tags)
     VALUES (?, ?, ?, ?)`
  )
  const result = stmt.run(title, content, summary, tags)
  return result.lastInsertRowid
}

/**
 * 根据 ID 删除一篇文章
 *
 * 输入：id - 要删除的文章编号
 * 输出：布尔值，true 表示删除了记录，false 表示没找到
 */
function deleteArticle(id) {
  // 事务保护：确保关联表删除与主表删除原子操作
  // 外键关联表（按删除顺序）：
  //   article_tags     — FOREIGN KEY (article_id) REFERENCES articles(id)
  //   article_versions — FOREIGN KEY (article_id) REFERENCES articles(id)
  //   visits           — 无外键约束，但有 article_id 关联
  try {
    db.exec('BEGIN')
    db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(id)
    db.prepare('DELETE FROM article_versions WHERE article_id = ?').run(id)
    db.prepare('DELETE FROM visits WHERE article_id = ?').run(id)
    const stmt = db.prepare('DELETE FROM articles WHERE id = ?')
    const result = stmt.run(id)
      // Clean up isolated tags (no longer associated with any article)
      db.prepare('DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM article_tags)').run()
    db.exec('COMMIT')
    return result.changes > 0
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}


/**
 * 获取已发布的文章
 * 输出：仅包含 status='published' 的文章
 */
function getPublishedArticles() {
  var stmt = db.prepare(
    "SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC"
  )
  return stmt.all()
}

/**
 * 更新文章状态
 * 输入：id - 文章编号，status - 状态（draft/published）
 * 输出：布尔值
 */

/**
 * 获取分页文章列表
 * 输入：{ page, limit, status }
 * 输出：{ articles, total, page, limit, totalPages }
 */
function getArticlesPaginated(params) {
  console.log("=== NEW getArticlesPaginated RUN ===")
  var page = params.page || 1
  var limit = params.limit || 10
  var status = params.status || "published"
  var category = params.category || null
  console.log("category =", category)
  var offset = (page - 1) * limit

  var allowed = ["published", "draft", "all"]
  if (allowed.indexOf(status) === -1) {
    status = "published"
  }

  var whereClause = ""
  var queryParams = []

  if (status !== "all") {
    whereClause = " WHERE articles.status = ?"
    queryParams.push(status)
  }

  if (category) {

    console.log("进入分类查询")
    
    whereClause += whereClause
      ? " AND categories.slug = ?"
      : " WHERE categories.slug = ?"

    queryParams.push(category)
  }

  console.log("SQL WHERE:", whereClause)
  console.log("SQL PARAMS:", queryParams)


  var sql = `
    SELECT articles.*
    FROM articles
    LEFT JOIN categories
    ON articles.category_id = categories.id
    ${whereClause}
    ORDER BY articles.created_at DESC
    LIMIT ? OFFSET ?
  `


  queryParams.push(limit)
  queryParams.push(offset)


  var stmt = db.prepare(sql)

  var articles = stmt.all(...queryParams)


  var total = countArticles({
    status: status,
    category: category
  })


  return {
    articles: articles,
    pagination: {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

/**
 * 统计文章数量
 * 输入：{ status } - "published"/"draft"/"all"
 */
function countArticles(params) {
  var status = params.status || "all"
  var category = params.category || null
  var allowed = ["published", "draft", "all"]
  if (allowed.indexOf(status) === -1) status = "all"

  var whereClause = ""
  var queryParams = []
  if (status !== "all") {
    whereClause = " WHERE articles.status = ?"
    queryParams.push(status)
  }

  if (category) {
    whereClause += whereClause
      ? " AND categories.slug = ?"
      : " WHERE categories.slug = ?"
    queryParams.push(category)
  }

  var stmt = db.prepare(
    "SELECT COUNT(*) AS count FROM articles LEFT JOIN categories ON articles.category_id = categories.id" + whereClause
  )
  return stmt.get(...queryParams).count
}
function updateArticleStatus(id, status) {
  var stmt = db.prepare(
    "UPDATE articles SET status = ? WHERE id = ?"
  )
  var result = stmt.run(status, id)
  return result.changes > 0
}

// 导出所有函数，供外部模块使用
function updateArticle(id, data) {
  var title = data.title
  var content = data.content
  var summary = data.summary || ""
  var tags = data.tags || ""
  var stmt = db.prepare(
    "UPDATE articles SET title = ?, content = ?, summary = ?, tags = ? WHERE id = ?"
  )
  var result = stmt.run(title, content, summary, tags, id)
  return result.changes > 0
}


function saveArticleTags(articleId, tags) {
  var Tag = require("./tagModel")
  Tag.saveArticleTags(articleId, tags)
}
function getArticleTags(articleId) {
  var Tag = require("./tagModel")
  return Tag.getArticleTags(articleId)
}

function getArticleCategory(articleId) {
  return db.prepare("SELECT c.id, c.name, c.slug FROM categories c JOIN articles a ON c.id = a.category_id WHERE a.id = ?").get(articleId)
}
module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  deleteArticle,
  updateArticle,
  getPublishedArticles,
  updateArticleStatus,
  getArticlesPaginated,
  countArticles,
  getArticleCategory,
  saveArticleTags,
  getArticleTags
}
