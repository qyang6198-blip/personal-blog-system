// 访问统计路由模块
//
// 职责：
//   定义访问统计相关的 API 路由。
//   GET /api/stats 需要登录，POST /api/visits 公开。

const express = require('express')
const router = express.Router()
const visitController = require('../controllers/visitController')
const authMiddleware = require('../middleware/authMiddleware')

// POST /api/visits - 记录一次页面访问（不需要登录）
router.post('/visits', visitController.recordVisit)

// GET /api/stats - 获取每日 PV 统计数据（需要登录）
router.get('/stats', authMiddleware, visitController.getStats)


// GET /api/stats/detail - 获取详细统计（PV + UV + 每日明细，需要登录）
router.get('/stats/detail', authMiddleware, visitController.getStatsDetail)

module.exports = router
