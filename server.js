// 服务器入口文件

// 优先加载 dotenv，确保所有 process.env 可用
require('dotenv').config()
const logger = require("./utils/logger")
//
// 职责：
//   启动 Express 服务器，初始化数据库，注册中间件和路由。
//
// 为什么导出 app：
//   测试文件（test-api.js）可以导入 app 自己控制服务器启动，
//   而运行 npm start 时正常启动。

// 1. 加载依赖模块
 const express = require('express'); var compression = null; try { compression = require('compression') } catch(e) { logger.warn('[Server] compression not available') }; var helmet = null; try { helmet = require('helmet') } catch(e) { logger.warn('[Server] helmet not available') }
const path = require('path')

// 2. 初始化数据库（建表）
//    必须在注册路由之前执行，确保表已存在
const initDatabase = require('./database/init')
initDatabase()

// 3. 创建 Express 应用实例
const app = express()

// 4. 定义服务器端口
const PORT = process.env.PORT || 3000

// 5. 注册中间件
//    express.json() - 解析请求体中的 JSON 数据
app.use(express.json())
//    express.static() - 直接返回 public 文件夹里的静态文件
app.use(express.static(path.join(__dirname, 'public')))

 if (compression) { app.use(compression()) }
 if (helmet) { app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })) }
 app.use(function(req, res, next) { var start = Date.now(); res.on('finish', function() { var d = Date.now() - start; if (d > 500) { logger.warn('[Slow] ' + req.method + ' ' + req.originalUrl + ' (' + d + 'ms)') } }); next() })
 if (process.env.NODE_ENV === 'production') { var ct = 86400000; app.use('/js', express.static(path.join(__dirname, 'public', 'js'), { maxAge: ct })); app.use('/css', express.static(path.join(__dirname, 'public', 'css'), { maxAge: ct })) }
 // 6. 注册路由
//    把 /api/articles 开头的请求交给 articleRoutes 处理
const rateLimiter = require('./middleware/rateLimiter')
const permissionMiddleware = require('./middleware/permissionMiddleware')
const authMiddleware = require('./middleware/authMiddleware')
const rateLimit = require('express-rate-limit')

const articleRoutes = require('./routes/articleRoutes')
app.use('/api/articles', articleRoutes)

// 注册认证路由
const authRoutes = require('./routes/authRoutes')
app.use('/api/login', rateLimiter.loginLimiter)
app.use('/api', authRoutes)

const uploadRoutes = require('./routes/uploadRoutes')
const tagRoutes = require('./routes/tagRoutes')
const searchRoutes = require('./routes/searchRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const rssRoutes = require('./routes/rssRoutes')
const visitRoutes = require('./routes/visitRoutes')
app.use('/api/visits', rateLimiter.visitLimiter)
app.use('/api', visitRoutes)
app.use('/api/upload', rateLimiter.uploadLimiter)
app.use('/api', uploadRoutes)
app.use('/api', searchRoutes)
app.use('/api', categoryRoutes)
app.use('/api', tagRoutes)
app.use(rssRoutes)

// 8. 健康检查路由
app.get('/api/health', (req, res) => {
  var dbOk = false
  try {
    const db = require('./database/database')
    db.prepare('SELECT 1').get()
    dbOk = true
  } catch (e) {
    dbOk = false
  }

  res.json({
    success: true,
    data: {
      status: dbOk ? 'ok' : 'degraded',
      uptime: process.uptime(),
      database: dbOk ? 'connected' : 'disconnected',
      version: '1.0.0'
    }
  })
})

// 9. 导出 app 实例
//    这样 test-api.js 可以导入 app，自己控制启动和关闭
// 注册全局错误处理中间件（必须在所有路由之后）

// Dashboard API - 返回后台概览数据
app.get('/api/admin/dashboard', authMiddleware, permissionMiddleware.requireEditor, function(req, res, next) {
  try {
    var db = require('./database/database')
    var totalArticles = db.prepare("SELECT COUNT(*) AS count FROM articles").get().count
    var published = db.prepare("SELECT COUNT(*) AS count FROM articles WHERE status='published'").get().count
    var drafts = db.prepare("SELECT COUNT(*) AS count FROM articles WHERE status='draft'").get().count
    var totalPV = db.prepare("SELECT COUNT(*) AS count FROM visits").get().count
    var totalUV = db.prepare("SELECT COUNT(DISTINCT visitor_hash) AS count FROM visits WHERE visitor_hash IS NOT NULL AND visitor_hash != ''").get().count
    res.json({ success: true, data: { articles: { total: totalArticles, published: published, drafts: drafts }, visits: { pv: totalPV, uv: totalUV } } })
  } catch(err) { next(err) }
})

// 备份路由
var backupLimiter = rateLimit({ windowMs: 60 * 1000, max: 3, message: { success: false, message: "备份请求过于频繁" }, standardHeaders: true, legacyHeaders: false })
app.post('/api/admin/backup', authMiddleware, permissionMiddleware.requireAdmin, backupLimiter, function(req, res, next) {
  try {
    var backupUtil = require('./utils/backup')
    var file = backupUtil.createBackup()
    var fileName = file.split(/[\\\/]/).pop()
    res.json({ success: true, data: { file: fileName } })
  } catch(err) { next(err) }
})
 const mediaRoutes = require('./routes/mediaRoutes')
 app.use('/api', mediaRoutes)
 const versionRoutes = require('./routes/versionRoutes')
 app.use('/api', versionRoutes)
 const errorMiddleware = require('./middleware/errorMiddleware')

app.use(errorMiddleware)

module.exports = app

// 10. 如果直接运行 server.js（而非被其他文件 require），才启动服务器
//    require.main === module 是 Node.js 判断"当前文件是不是入口文件"的标准方式
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info('服务器已启动：http://localhost:' + PORT)
    logger.info('健康检查：http://localhost:' + PORT + '/api/health')
  })
}
