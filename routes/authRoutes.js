// 认证路由模块
//
// 职责：定义登录相关的 API 路由。
// POST /api/login → authController.login

const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/login', authController.login)

module.exports = router
