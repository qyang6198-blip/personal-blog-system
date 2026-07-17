// 测试环境配置
//
// 用途：
//   提供测试环境的初始化与清理功能。
//   测试文件可以 require 此模块来统一管理测试数据。
//
// 用法：
//   const { setup, teardown } = require('./setup')
//   setup()
//   // ... run tests ...
//   teardown()

const initDatabase = require('../database/init')
const db = require('../database/database')

/**
 * 初始化测试环境
 * 确保数据库表已创建
 */
function setup() {
  initDatabase()
}

/**
 * 清理测试数据
 * 清空 visits 和 articles 表中的测试数据
 */
function teardown() {
  db.prepare('DELETE FROM visits').run()
  db.prepare('DELETE FROM articles WHERE title LIKE ?', ['test%']).run()
}

module.exports = { setup, teardown }
