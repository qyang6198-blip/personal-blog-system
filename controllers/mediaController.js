 var path = require('path')
 var fs = require('fs')
 var Media = require('../models/mediaModel')
 
 function uploadMedia(req, res) {
   if (!req.file) {
     return res.status(400).json({ success: false, message: '请选择图片文件' })
   }
   var result = Media.create({
     filename: req.file.filename,
     original_name: req.file.originalname,
     path: '/uploads/' + req.file.filename,
     mime_type: req.file.mimetype,
     size: req.file.size
   })
   res.json({ success: true, data: { id: result.id, url: result.path } })
 }
 
 function getMedia(req, res) {
   var list = Media.findAll()
   var items = list.map(function(m) {
     return {
       id: m.id,
       url: m.path,
       name: m.original_name,
       filename: m.filename,
       size: m.size,
       mime_type: m.mime_type,
       created_at: m.created_at
     }
   })
   res.json({ success: true, data: items })
 }
 
 function deleteMedia(req, res) {
   var id = Number(req.params.id)
   if (!id) {
     return res.status(400).json({ success: false, message: '缺少图片ID' })
   }
   var media = Media.findById(id)
   if (!media) {
     return res.status(404).json({ success: false, message: '图片不存在' })
   }
   Media.deleteById(id)
   var filePath = path.join(__dirname, '..', 'public', 'uploads', media.filename)
   try {
     if (fs.existsSync(filePath)) {
       fs.unlinkSync(filePath)
     }
   } catch (e) {
     // file might already be deleted, ignore
   }
   res.json({ success: true, data: { message: '删除成功' } })
 }
 
 module.exports = { uploadMedia, getMedia, deleteMedia }
