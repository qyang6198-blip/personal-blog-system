// RSS 订阅控制器
//
// 职责：生成 RSS 2.0 XML Feed，包含最近 20 篇已发布文章。
// 访问：GET /rss.xml

const Article = require('../models/articleModel')

/**
 * 生成 RSS XML
 * 只包含 status='published' 的文章，最多 20 篇
 */
function getRssFeed(req, res) {
  var articles = Article.getPublishedArticles()
  // 限制最多 20 篇
  articles = articles.slice(0, 20)

  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
  xml += '  <channel>\n'
  xml += '    <title>我的博客</title>\n'
  xml += '    <link>http://localhost:3000</link>\n'
  xml += '    <description>个人博客系统</description>\n'
  xml += '    <atom:link href="http://localhost:3000/rss.xml" rel="self" type="application/rss+xml"/>\n'

  articles.forEach(function(a) {
    var pubDate = ''
    if (a.created_at) {
      pubDate = new Date(a.created_at).toUTCString()
    }

    xml += '    <item>\n'
    xml += '      <title>' + escapeXml(a.title) + '</title>\n'
    xml += '      <link>http://localhost:3000/article.html?id=' + a.id + '</link>\n'
    xml += '      <description>' + escapeXml(a.summary || a.content.substring(0, 200)) + '</description>\n'
    xml += '      <pubDate>' + pubDate + '</pubDate>\n'
    xml += '      <guid>http://localhost:3000/article.html?id=' + a.id + '</guid>\n'
    xml += '    </item>\n'
  })

  xml += '  </channel>\n'
  xml += '</rss>'

  res.set('Content-Type', 'application/rss+xml; charset=utf-8')
  res.send(xml)
}

/**
 * XML 转义：防止特殊字符破坏 XML 结构
 */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}


/**
 * ?? Sitemap XML
 * ????????????
 */
function getSitemap(req, res) {
  var articles = Article.getPublishedArticles()
  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  xml += '  <url>\n    <loc>http://localhost:3000/</loc>\n    <priority>1.0</priority>\n  </url>\n'
  articles.forEach(function(a) {
    var date = a.created_at ? a.created_at.split(" ")[0] : ""
    xml += '  <url>\n    <loc>http://localhost:3000/article.html?id=' + a.id + '</loc>\n'
    if (date) xml += '    <lastmod>' + date + '</lastmod>\n'
    xml += '    <priority>0.8</priority>\n  </url>\n'
  })
  xml += '</urlset>'
  res.set("Content-Type", "application/xml; charset=utf-8")
  res.send(xml)
}

module.exports = { getRssFeed, getSitemap }
