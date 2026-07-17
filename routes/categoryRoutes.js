const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/categoryController")

 var authMiddleware = require('../middleware/authMiddleware')
 router.get('/categories', categoryController.getCategories)
 router.post('/categories', authMiddleware, categoryController.createCategory)
 router.put('/categories/:id', authMiddleware, categoryController.updateCategory)
 router.delete('/categories/:id', authMiddleware, categoryController.deleteCategory)
 router.get('/categories/:slug/articles', categoryController.getArticlesByCategory)

module.exports = router
