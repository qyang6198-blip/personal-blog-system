// 数据库连接管理模块
//
// 职责：
//   打开/创建 SQLite 数据库文件，导出一个数据库实例。
//
// 为什么单独写一个文件：
//   所有需要操作数据库的模块（models、init）都共用这一个连接，
//   避免每个文件各自创建连接，造成资源浪费或数据冲突。
//
// 数据流：
//   init.js（建表）→ database.js（连接）
//   models（增删查改）→ database.js（连接）→ SQLite 文件

const path = require('path')
const fs = require('fs')
const { DatabaseSync } = require('node:sqlite')

// 数据库文件路径：项目根目录/data/blog.sqlite
 const dbPath = path.join(__dirname, '..', 'data', 'blog.sqlite')

// 确保数据库目录存在
// SQLite 不会自动创建父目录
var dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// 创建同步数据库连接
// 如果 blog.sqlite 不存在，会自动创建该文件
const db = new DatabaseSync(dbPath)

// 启用 WAL 模式（Write-Ahead Logging）
// 作用：提升并发读写性能，读操作不会阻塞写操作
 db.exec('PRAGMA journal_mode = DELETE')
 db.exec('PRAGMA busy_timeout = 5000')
 db.exec('PRAGMA foreign_keys = ON')

// 导出 db 实例，供其他模块使用
 module.exports = db
