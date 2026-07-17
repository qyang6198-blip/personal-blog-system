// 全局错误处理中间件
//
// 职责：
//   捕获所有控制器中未被处理的错误，统一返回格式。
//
// Express 中间件签名：
//   (err, req, res, next) — 四个参数，Express 自动识别为错误处理中间件

const logger = require('../utils/logger')

/**
 * 全局错误处理
 *
 * 开发环境（NODE_ENV !== 'production'）：返回详细错误信息 + stack
 * 生产环境：只返回错误消息，隐藏技术细节
 */
function errorMiddleware(err, req, res, next) {
  // 记录错误日志
  logger.error('请求处理出错', err)

  // 获取 HTTP 状态码（可自定义，默认 500）
  var status = err.status || 500
  var message = err.message || '服务器内部错误'

  // 开发环境返回详细错误
  if (process.env.NODE_ENV !== 'production') {
    return res.status(status).json({
      success: false,
      message: message,
      stack: err.stack
    })
  }

  // 生产环境只返回错误消息
  res.status(status).json({
    success: false,
    message: message
  })
}

module.exports = errorMiddleware
