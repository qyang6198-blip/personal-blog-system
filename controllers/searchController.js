const Search = require("../models/searchModel")
const Article = require("../models/articleModel")
const authController = require("./authController")

function search(req, res) {
  var keyword = (req.query.q || "").trim().substring(0, 50)
  if (!keyword) return res.json({ success: true, data: { keyword: "", articles: [] } })
  var results = Search.searchArticles(keyword)
  var authHeader = req.headers.authorization
  var isAdmin = false
  if (authHeader && authHeader.indexOf("Bearer ") === 0) {
    var token = authHeader.split(" ")[1]
    if (authController.verifyToken(token)) isAdmin = true
  }
  if (!isAdmin) results = results.filter(function(a){return a.status === "published"})
  results.forEach(function(a) {
    if (typeof a.tags === "string") a.tags = a.tags.split(",").map(function(t){return t.trim()}).filter(function(t){return t})
    if (a.category_id) a.category = Article.getArticleCategory(a.id)
  })
  res.json({ success: true, data: { keyword: keyword, articles: results } })
}

module.exports = { search }
