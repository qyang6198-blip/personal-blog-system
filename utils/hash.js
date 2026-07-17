// 哈希工具函数
//
// 职责：
//   生成访问者哈希值，用于 UV 统计。
//   使用 SHA256 对 IP + User-Agent 进行哈希，
//   不存储原始敏感信息。

const crypto = require('crypto')

/**
 * 根据 IP 和 User-Agent 生成访问者哈希
 *
 * 输入：ip - 访问者 IP 地址
 *       userAgent - 浏览器 User-Agent 字符串
 * 输出：SHA256 哈希字符串（64位十六进制）
 *
 * 为什么这样设计：
 *   IP + UA 的组合可以很好地区分不同访问者
 *   使用 SHA256 哈希，不存储原始 IP，保护隐私
 *   同一个用户（相同 IP + UA）生成相同的 hash
 */
function getVisitorHash(ip, userAgent) {
  if (!ip) ip = ''
  if (!userAgent) userAgent = ''
  var raw = ip + '|' + userAgent
  return crypto.createHash('sha256').update(raw).digest('hex')
}

module.exports = {
  getVisitorHash
}
