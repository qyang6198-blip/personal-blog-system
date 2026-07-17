const hashUtil = require('../utils/hash')
// 访问统计控制器
//
// 职责：
//   处理访问统计相关的 HTTP 请求。
//   recordVisit  - 记录一次页面访问
//   getStats     - 返回每日 PV 数据

const Visit = require('../models/visitModel')

/**
 * 记录一次页面访问
 *
 * 请求：POST /api/visits
 * 输入：{ article_id: 3 } 或 { article_id: null }（首页访问）
 * 输出：201 或 400
 */
function recordVisit(req, res, next) {
  var article_id = req.body.article_id

  // 参数校验：article_id 必须存在（可以传 null 表示首页访问）
  // 如果没传 article_id 字段，返回 400
  if (article_id === undefined) {
    return res.status(400).json({ success: false, message: '缺少 article_id' })
  }

  // 如果 article_id 不是 null 且不是数字，也返回 400
  if (article_id !== null && (typeof article_id !== 'number' || isNaN(article_id))) {
    return res.status(400).json({ message: 'article_id 必须是数字或 null' })
  }

  // 从请求中获取访问者信息
  var ip = req.ip
  var userAgent = req.headers['user-agent'] || ''

  try {
    // 调用 Model 层写入数据库
        Visit.createVisit({
      article_id: article_id,
      ip: ip,
      user_agent: userAgent,
      visitor_hash: hashUtil.getVisitorHash(ip, userAgent)
    })
    res.status(201).json({ success: true, data: { message: '访问记录成功' } })
  } catch (err) {
    // 数据库错误时返回 500，不让服务器崩溃
    res.status(500).json({ message: '服务器内部错误' })
  }
}

/**
 * 获取每日 PV 统计数据
 *
 * 请求：GET /api/stats（需要登录）
 * 输出：200 + [{ date: "2026-07-16", count: 3 }, ...]
 */
function getStats(req, res, next) {
  try {
    var data = Visit.getDailyPV()
    res.json(data)
  } catch (err) { next(err) }
}


/**
 * 获取详细统计（PV + UV + 每日明细）
 *
 * 请求：GET /api/stats/detail（需要登录）
 * 输出：{ pv: 1000, uv: 300, daily: [...] }
 */
function getStatsDetail(req, res, next) {
  try {
    var dailyData = Visit.getDailyStats()
    var totalPV = 0
    var totalUV = 0
    for (var i = 0; i < dailyData.length; i++) {
      totalPV += dailyData[i].pv
      totalUV += dailyData[i].uv
    }
    res.json({
      success: true,
      data: {
        pv: totalPV,
        uv: totalUV,
        daily: dailyData
      }
    })
  } catch (err) { next(err) }
}

module.exports = {
  getStatsDetail,
  recordVisit,
  getStats
}
