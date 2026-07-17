// 简单日志工具
//
// 职责：
//   统一日志输出格式，替代直接使用 console.log。
//   后续可以扩展为写入文件或接入日志服务。
//
// 用法：
//   logger.info('服务器已启动')
//   logger.error('数据库连接失败', err)
//   logger.warn('磁盘空间不足')

/**
 * 获取当前时间的格式化字符串
 * 输出格式：2026-07-16 12:00:00
 */
 var fs = require('fs')
 var path = require('path')
 var logDir = path.join(__dirname, '..', 'logs')
 if (!fs.existsSync(logDir)) { try { fs.mkdirSync(logDir, { recursive: true }) } catch(e) {} }
 var logStream = null, errorStream = null
 try { logStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' }); logStream.on('error', function() { logStream = null }) } catch(e) {}
 try { errorStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' }); errorStream.on('error', function() { errorStream = null }) } catch(e) {}
 function getTimestamp() {
  var now = new Date()
  var year = now.getFullYear()
  var month = String(now.getMonth() + 1).padStart(2, '0')
  var day = String(now.getDate()).padStart(2, '0')
  var hours = String(now.getHours()).padStart(2, '0')
  var minutes = String(now.getMinutes()).padStart(2, '0')
  var seconds = String(now.getSeconds()).padStart(2, '0')
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
}

/**
 * 输出信息日志
 */
function info(message) {
  console.log('[' + getTimestamp() + '] INFO ' + message)
}

/**
 * 输出错误日志
 * 可附带 Error 对象，自动提取 stack
 */
function error(message, err) {
  var text = '[' + getTimestamp() + '] ERROR ' + message
  if (err) {
    text += '\n' + (err.stack || err.message || err)
  }
  console.error(text)
}

/**
 * 输出警告日志
 */
function warn(message) {
  console.log('[' + getTimestamp() + '] WARN ' + message)
}

module.exports = {
  info: info,
  error: error,
  warn: warn
}
