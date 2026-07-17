// 数据库测试文件
//
// 用途：独立验证数据库能否正常连接、建表、读写。
// 不依赖服务器，可单独运行：node test-db.js

const db = require('./database/database')
const initDatabase = require('./database/init')

console.log('--- 数据库测试开始 ---')

// 1. 初始化表结构
console.log('[1/3] 初始化表结构...')
initDatabase()

// 2. 插入一条测试文章并读取
console.log('[2/3] 测试读写...')
const insertStmt = db.prepare(
  'INSERT INTO articles (title, content, summary, tags) VALUES (?, ?, ?, ?)'
)
const result = insertStmt.run(
  '你好，世界',
  '这是我的第一篇博客文章。',
  '测试摘要',
  '测试,入门'
)
console.log('插入成功，文章 ID:', result.lastInsertRowid)

// 读取刚插入的数据
const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid)
console.log('读取成功，标题:', article.title)

// 3. 清理测试数据
console.log('[3/3] 清理测试数据...')
db.prepare('DELETE FROM articles WHERE id = ?').run(result.lastInsertRowid)

console.log('--- 数据库测试通过 ---')
