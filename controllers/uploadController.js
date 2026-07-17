// 图片上传控制器
//
// 职责：
//   处理图片上传请求，返回图片 URL。

/**
 * 上传图片
 *
 * 请求：POST /api/upload（需要登录）
 * 请求格式：multipart/form-data，字段名 image
 * 成功返回：{ success: true, data: { url: "/uploads/filename.png" } }
 * 失败返回：{ success: false, message: "错误信息" }
 */
function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '请选择图片文件' })
  }

  // 生成图片 URL（相对于网站根目录）
  var url = '/uploads/' + req.file.filename

  res.json({ success: true, data: { url: url } })
}

module.exports = {
  uploadImage
}
