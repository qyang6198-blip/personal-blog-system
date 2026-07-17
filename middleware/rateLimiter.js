// API 限流中间件
//
// 职责：
//   防止恶意请求和暴力破解。对不同接口设置不同的频率限制。
//
// 为什么需要限流：
//   - 登录接口：防止暴力破解密码
//   - 上传接口：防止大量上传耗尽磁盘
//   - 访问记录：防止刷 PV

var rateLimit = require("express-rate-limit")

// 登录限流：每分钟 5 次
var loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "请求过于频繁，请稍后重试" },
  standardHeaders: true,
  legacyHeaders: false
})

// 上传限流：每分钟 20 次
var uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "上传过于频繁，请稍后重试" },
  standardHeaders: true,
  legacyHeaders: false
})

// 访问记录限流：每分钟 60 次
var visitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: "请求过于频繁" },
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = {
  loginLimiter,
  uploadLimiter,
  visitLimiter
}
