// RSS 订阅路由
//
// 注册到根路径：GET /rss.xml

const express = require('express')
const router = express.Router()
const rssController = require('../controllers/rssController')

// GET /rss.xml - 获取 RSS Feed
router.get('/rss.xml', rssController.getRssFeed)

router.get('/sitemap.xml', rssController.getSitemap)

module.exports = router
