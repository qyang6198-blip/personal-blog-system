// 认证中间件
//
// 职责：
//   验证 JWT token 并将用户信息挂到 req.user。
//   req.user 包含 { id, username, role }，供后续中间件和控制器使用。

var authController = require("../controllers/authController")

function authMiddleware(req, res, next) {
  var authHeader = req.headers["authorization"]
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "未提供认证信息" })
  }
  var parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "认证格式错误" })
  }
  var token = parts[1]
  var decoded = authController.verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ message: "token 无效或已过期" })
  }
  req.user = decoded
  next()
}

module.exports = authMiddleware
