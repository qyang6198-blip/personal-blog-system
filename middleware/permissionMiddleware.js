// 权限中间件
//
// 职责：
//   在 authMiddleware 之后使用，检查用户角色。
//   authMiddleware 已经验证了 token，
//   这里从 token 中读取 role 字段来判断权限。

/**
 * 要求管理员权限
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "权限不足，需要管理员权限" })
  }
  next()
}

/**
 * 要求编辑权限及以上（admin 或 editor）
 */
function requireEditor(req, res, next) {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "editor")) {
    return res.status(403).json({ success: false, message: "权限不足，需要编辑权限" })
  }
  next()
}

module.exports = {
  requireAdmin,
  requireEditor
}
