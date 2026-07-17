// 数据库备份工具
//
// 职责：
//   备份 SQLite 数据库文件到 backup/ 目录。
//   文件名包含日期，便于区分版本。
//
// 为什么需要手动备份：
//   SQLite 是单文件数据库，复制文件即可备份。
//   在部署前备份可以防止数据丢失。

var fs = require("fs")
var path = require("path")

var BACKUP_DIR = path.join(__dirname, "..", "backup")
var DB_PATH = path.join(__dirname, "..", "data", "blog.sqlite")

/**
 * 执行数据库备份
 *
 * 返回：备份文件的完整路径
 */
function createBackup() {
  // 确保备份目录存在
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }

  // 生成文件名：blog-YYYY-MM-DD.sqlite
  var now = new Date()
  var dateStr = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0")
  var backupFile = path.join(BACKUP_DIR, "blog-" + dateStr + ".sqlite")

  // 复制数据库文件
  if (fs.existsSync(DB_PATH)) {
    fs.copyFileSync(DB_PATH, backupFile)
    return backupFile
  } else {
    throw new Error("数据库文件不存在: " + DB_PATH)
  }
}

// 如果直接运行此文件（node utils/backup.js），执行备份
if (require.main === module) {
  try {
    var file = createBackup()
    console.log("备份成功:", file)
  } catch (err) {
    console.error("备份失败:", err.message)
    process.exit(1)
  }
}

module.exports = { createBackup }
