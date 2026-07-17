// 数据库初始化模块
//
// 职责：
//   在服务器启动时检查并创建 articles 表。
//   只在启动时运行一次，运行完成后不再需要。
//
// 为什么和 database.js 分开：
//   database.js 负责"连上数据库"（运行时一直用）
//   init.js 负责"准备好表结构"（启动时跑一次就够了）
//   分开后，未来要加新表或改表结构，只改这里，不影响连接逻辑。

const db = require('./database')
const logger = require("../utils/logger")

// 初始化数据库表结构
// IF NOT EXISTS → 表已存在时不会重复创建，不会报错
 var runMigrations = require('./migrate')
 function initDatabase() {
   runMigrations(db)
   db.exec(`
     CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
 `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER,
      ip TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)



  db.exec("CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)")
  db.exec("CREATE TABLE IF NOT EXISTS article_tags (id INTEGER PRIMARY KEY AUTOINCREMENT, article_id INTEGER NOT NULL, tag_id INTEGER NOT NULL, FOREIGN KEY (article_id) REFERENCES articles(id), FOREIGN KEY (tag_id) REFERENCES tags(id), UNIQUE(article_id, tag_id))")
  
  db.exec("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)")
  var catCols = db.prepare("PRAGMA table_info('articles')").all()
  var hasCatId = catCols.some(function(c){return c.name === "category_id"})
  if (!hasCatId) {
    db.exec("ALTER TABLE articles ADD COLUMN category_id INTEGER REFERENCES categories(id)")
  }

   try {
     db.exec("CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(title, summary, content, article_id UNINDEXED)")
     db.exec("DELETE FROM articles_fts")
     var ftsRows = db.prepare("SELECT id, title, content, summary FROM articles").all()
     var insFTS = db.prepare("INSERT INTO articles_fts (title, summary, content, article_id) VALUES (?, ?, ?, ?)")
     ftsRows.forEach(function(a) { insFTS.run(a.title, a.summary || "", a.content, a.id) })
   } catch(e) { require("../utils/logger").warn('[FTS] Rebuild skipped: ' + e.message) }
// Migration: add status column to articles table
  var cols = db.prepare("PRAGMA table_info('articles')").all()
  var hasStatus = cols.some(function(c) { return c.name === "status" })
  if (!hasStatus) {
    db.exec("ALTER TABLE articles ADD COLUMN status TEXT DEFAULT 'draft'")
    db.exec("UPDATE articles SET status = 'published' WHERE status IS NULL")
  }

 
  // Migration: add visitor_hash column to visits table
  var visitCols = db.prepare("PRAGMA table_info('visits')").all()
  var hasHash = visitCols.some(function(c) { return c.name === "visitor_hash" })
  if (!hasHash) {
    db.exec("ALTER TABLE visits ADD COLUMN visitor_hash TEXT")
  }

  // Create users table
  db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'editor', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)")

  // Seed: create default admin if no users exist
  var userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count
  if (userCount === 0) {
    var bc = require("bcryptjs")
    var salt = bc.genSaltSync(10)
    var hash = bc.hashSync(process.env.ADMIN_PASSWORD || "123456", salt)
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)").run(process.env.ADMIN_USERNAME || "admin", hash, "admin")
    logger.info("✔ 已创建默认管理员账户")
  }


   // Create media table
   db.exec("CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, original_name TEXT NOT NULL, path TEXT NOT NULL, mime_type TEXT, size INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)")
   // Create article_versions table
   db.exec("CREATE TABLE IF NOT EXISTS article_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, article_id INTEGER NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, summary TEXT, tags TEXT, category_id INTEGER, status TEXT DEFAULT 'draft', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (article_id) REFERENCES articles(id))")
 logger.info('✓ 数据库表初始化完成')
}

module.exports = initDatabase
