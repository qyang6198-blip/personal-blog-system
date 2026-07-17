// 文章路由模块
//
// 职责：定义文章相关的 API 路由，将请求分发给对应的控制器。
// GET 接口公开访问，POST/DELETE 需要登录验证。

const express = require('express')
const router = express.Router()
const articleController = require('../controllers/articleController')
const authMiddleware = require('../middleware/authMiddleware')

// 公开接口（不需要登录）
router.get('/', articleController.getArticles)
router.get('/:id', articleController.getArticle)

// 需要登录的接口（需携带 Authorization header）
router.post('/', authMiddleware, articleController.createArticle)
router.post('/:id/publish', authMiddleware, articleController.publishArticle)
router.post('/:id/draft', authMiddleware, articleController.draftArticle)
router.put('/:id', authMiddleware, articleController.updateArticle)
router.delete('/:id', authMiddleware, articleController.deleteArticle)

 router.put('/:id/autosave', authMiddleware, articleController.autoSaveArticle)
 module.exports = router
