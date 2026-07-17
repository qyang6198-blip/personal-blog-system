 var path = require('path')
 var fs = require('fs')
 var logger = require('../utils/logger')
 
 function runMigrations(db) {
   db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT UNIQUE NOT NULL, executed_at DATETIME DEFAULT CURRENT_TIMESTAMP)")
   var executed = {}
   db.prepare("SELECT filename FROM schema_migrations").all().forEach(function(r) { executed[r.filename] = true })
   var migrationsDir = path.join(__dirname, 'migrations')
   if (!fs.existsSync(migrationsDir)) { fs.mkdirSync(migrationsDir, { recursive: true }); return }
   var files = fs.readdirSync(migrationsDir).filter(function(f) { return f.endsWith('.sql') }).sort()
   files.forEach(function(file) {
     if (executed[file]) { logger.info('[Migration] SKIP ' + file + ' (already executed)'); return }
     var sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
     try {
       db.exec(sql)
       db.prepare("INSERT INTO schema_migrations (filename) VALUES (?)").run(file)
       logger.info('[Migration] OK ' + file)
     } catch (e) {
       logger.error('[Migration] FAIL ' + file + ': ' + e.message)
       throw e
     }
   })
 }
 module.exports = runMigrations
