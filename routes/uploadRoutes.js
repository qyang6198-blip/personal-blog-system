// 图片上传路由模块
//
// 职责：
//   定义图片上传相关的 API 路由。

const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const uploadMiddleware = require('../middleware/uploadMiddleware')
const uploadController = require('../controllers/uploadController')

// POST /api/upload - 上传图片（需要登录）
// uploadMiddleware.single('image') 处理单个文件上传，字段名为 image
router.post(
  '/upload',
  authMiddleware,
  function(req, res, next) {
    uploadMiddleware.single('image')(req, res, function(err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: '文件大小不能超过 5MB' })
        }
        return res.status(400).json({ success: false, message: err.message })
      }
      res.locals.uploadedFile = req.file
      next()
    })
  },
  uploadController.uploadImage
)


// Multer ????????????
router.use(function(err, req, res, next) {
  if (err) {
    var msg = err.code === "LIMIT_FILE_SIZE"
      ? "文件大小不能超过 5MB"
      : (err.message || "上传失败")
    return res.status(400).json({ success: false, message: msg })
  }
  next(err)
})
module.exports = router
