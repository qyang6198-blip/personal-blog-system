// 文件上传中间件
//
// 职责：
//   使用 multer 处理图片上传，配置存储、文件过滤和大小限制。
//
// 上传流程：
//   前端选择文件 → FormData → multer 解析 → 保存到 public/uploads/

const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// 上传目录
const uploadDir = path.join(__dirname, '..', 'public', 'uploads')

// 如果目录不存在则创建
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// 最大文件大小：5MB
const MAX_SIZE = 5 * 1024 * 1024

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // 生成时间戳 + 随机字符串作为文件名
    var timestamp = Date.now()
    var random = crypto.randomBytes(4).toString('hex')
    var ext = path.extname(file.originalname).toLowerCase()
    cb(null, timestamp + '-' + random + ext)
  }
})

// 文件类型过滤器
function fileFilter(req, file, cb) {
  // 使用文件扩展名过滤，比 MIME 类型更可靠
  var ext = path.extname(file.originalname).toLowerCase()
  var allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  if (allowedExts.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('文件格式不支持，仅支持 JPG/PNG/GIF/WebP'))
  }
}

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_SIZE }
})

module.exports = upload
