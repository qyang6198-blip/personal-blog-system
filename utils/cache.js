// 简单内存缓存
//
// 职责：
//   减少数据库重复查询，提升 API 响应速度。
//   缓存存储在内存中，服务器重启后自动清除。
//
// 为什么不用 Redis：
//   SQLite + 单机部署的场景下，内存缓存已经够用。
//   Redis 会增加部署复杂度，不适合本项目当前规模。

/**
 * 内存缓存
 * 每条缓存包含：value（数据）、expiresAt（过期时间戳）
 */
var store = {}

var DEFAULT_TTL = 60 * 1000  // 默认缓存 60 秒

/**
 * 获取缓存
 * 如果不存在或已过期，返回 null
 */
function get(key) {
  var entry = store[key]
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    delete store[key]
    return null
  }
  return entry.value
}

/**
 * 设置缓存
 * ttl：过期时间（毫秒），默认 60 秒
 */
function set(key, value, ttl) {
  if (!ttl) ttl = DEFAULT_TTL
  store[key] = {
    value: value,
    expiresAt: Date.now() + ttl
  }
}

/**
 * 清除指定前缀的缓存
 * 例如：clearByPrefix("articles") 会清除所有以 "articles" 开头的键
 */
function clearByPrefix(prefix) {
  var keys = Object.keys(store)
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf(prefix) === 0) {
      delete store[keys[i]]
    }
  }
}

/**
 * 清除全部缓存
 */
function clearAll() {
  store = {}
}

module.exports = {
  get,
  set,
  clearByPrefix,
  clearAll
}
