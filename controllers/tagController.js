const Tag = require('../models/tagModel')

function getTags(req, res) {
  var tags = Tag.getAllTags()
  res.json({ success: true, data: tags })
}

function getArticlesByTag(req, res) {
  var name = req.params.name
  var articles = Tag.getArticlesByTag(name)
  articles.forEach(function(a) {
    if (typeof a.tags === 'string') {
      a.tags = a.tags.split(',').map(function(t){return t.trim()}).filter(function(t){return t})
    }
  })
  res.json({ success: true, data: articles })
}

module.exports = { getTags, getArticlesByTag }
