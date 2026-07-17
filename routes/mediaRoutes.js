 var express = require('express')
 var router = express.Router()
 var authMiddleware = require('../middleware/authMiddleware')
 var uploadMiddleware = require('../middleware/uploadMiddleware')
 var mediaController = require('../controllers/mediaController')
 
 router.get('/media', authMiddleware, mediaController.getMedia)
 
 router.post('/media/upload', authMiddleware, function(req, res, next) {
   uploadMiddleware.single('image')(req, res, function(err) {
     if (err) {
       if (err.code === 'LIMIT_FILE_SIZE') {
         return res.status(400).json({ success: false, message: '文件大小不能超过 5MB' })
       }
       return res.status(400).json({ success: false, message: err.message })
     }
     next()
   })
 }, mediaController.uploadMedia)
 
 router.delete('/media/:id', authMiddleware, mediaController.deleteMedia)
 
 module.exports = router
