// 访问统计数据模型
//
// 职责：
//   封装对 visits 表的数据库操作。
//   createVisit  - 记录一次访问
//   getDailyPV   - 获取每日 PV 聚合数据

const db = require('../database/database')

/**
 * 记录一次页面访问
 *
 * 输入：{ article_id, ip, user_agent }
 *   article_id - 文章 ID（首页访问传 null）
 *   ip         - 访客 IP 地址
 *   user_agent - 访客浏览器信息
 * 输出：新插入记录的 ID
 */
function createVisit(visitData) {
  const { article_id, ip, user_agent, visitor_hash } = visitData
  const stmt = db.prepare(
    'INSERT INTO visits (article_id, ip, user_agent, visitor_hash) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(article_id, ip, user_agent, visitor_hash || '')
  return result.lastInsertRowid
}

/**
 * 获取每日 PV（Page View）数据
 *
 * 输入：无
 * 输出：数组 [{ date: "2026-07-16", count: 150 }, ...]
 *   date  - 日期（YYYY-MM-DD 格式）
 *   count - 当日访问次数
 *
 * SQL 说明：
 *   DATE(created_at) 将完整时间戳截取为日期部分
 *   GROUP BY 按日期分组，COUNT(*) 统计每组记录数
 *   ORDER BY date ASC 按日期升序排列（旧日期在前）
 */
function getDailyPV() {
  const stmt = db.prepare(`
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM visits
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `)
  return stmt.all()
}


/**
 * 获取每日 PV + UV 统计
 *
 * 输出：数组 [{ date: "2026-07-16", pv: 150, uv: 80 }, ...]
 *   pv - 当日总访问次数
 *   uv - 当日独立访客数（按 visitor_hash 去重）
 */
function getDailyStats() {
  var stmt = db.prepare(`
    SELECT DATE(created_at) AS date,
           COUNT(*) AS pv,
           COUNT(DISTINCT visitor_hash) AS uv
    FROM visits
    WHERE visitor_hash IS NOT NULL AND visitor_hash != ''
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `)
  return stmt.all()
}

module.exports = {
  getDailyStats,
  createVisit,
  getDailyPV
}
