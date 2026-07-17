// 认证控制器
//
// 职责：
//   处理管理员登录，使用 JWT token。
//   用户信息存储在数据库 users 表中，密码用 bcrypt 哈希。

const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const JWT_SECRET = process.env.JWT_SECRET || "my-blog-jwt-secret-dev-only"
const TOKEN_EXPIRY = "7d"

function login(req, res) {
  var username = req.body.username
  var password = req.body.password
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "用户名和密码不能为空" })
  }
  var user = User.getUserByUsername(username)
  if (!user) {
    return res.status(401).json({ success: false, message: "用户名或密码错误" })
  }
  if (!User.verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ success: false, message: "用户名或密码错误" })
  }
  var payload = { id: user.id, username: user.username, role: user.role }
  var token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
  res.json({
    success: true,
    data: {
      token: token,
      user: { username: user.username, role: user.role }
    }
  })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

module.exports = { login, verifyToken }
