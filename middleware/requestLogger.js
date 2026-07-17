// 请求日志中间件
//
// 职责：
//   记录每个 HTTP 请求的方法、URL、状态码和响应时间。
//
// 执行时机：
//   在路由处理之前注册，响应完成后记录日志。

const logger = require('../utils/logger')

/**
 * 请求日志中间件
 *
 * 记录格式示例：
 *   [12:00:01] GET /api/articles 200 15ms
 */
function requestLogger(req, res, next) {
  var start = Date.now()

  // 监听响应完成事件
  res.on('finish', function () {
    var duration = Date.now() - start
    logger.info(
      req.method + ' ' + req.originalUrl + ' ' + res.statusCode + ' ' + duration + 'ms'
    )
  })

  next()
}

module.exports = requestLogger
