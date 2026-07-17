// 用户数据模型
//
// 职责：
//   封装对 users 表的数据库操作。
//   createUser  - 创建新用户
//   getUserByUsername - 根据用户名查询
//   getAllUsers - 获取所有用户（管理员用）
//   deleteUser  - 删除用户（管理员用）

const db = require("../database/database")
const bcrypt = require("bcryptjs")

/**
 * 创建新用户（密码自动哈希）
 */
function createUser(userData) {
  var username = userData.username
  var password = userData.password
  var role = userData.role || "editor"
  var salt = bcrypt.genSaltSync(10)
  var hash = bcrypt.hashSync(password, salt)
  var stmt = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
  var result = stmt.run(username, hash, role)
  return result.lastInsertRowid
}

/**
 * 根据用户名查找用户
 */
function getUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username)
}

/**
 * 验证密码
 */
function verifyPassword(plainPassword, hash) {
  return bcrypt.compareSync(plainPassword, hash)
}

/**
 * 获取所有用户
 */
function getAllUsers() {
  return db.prepare("SELECT id, username, role, created_at FROM users ORDER BY created_at ASC").all()
}

/**
 * 删除用户
 */
function deleteUser(id) {
  var result = db.prepare("DELETE FROM users WHERE id = ?").run(id)
  return result.changes > 0
}

module.exports = {
  createUser,
  getUserByUsername,
  verifyPassword,
  getAllUsers,
  deleteUser
}
