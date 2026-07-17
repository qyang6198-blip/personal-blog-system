const express = require('express')
const router = express.Router()
const tagController = require('../controllers/tagController')

router.get('/tags', tagController.getTags)
router.get('/tags/:name/articles', tagController.getArticlesByTag)

module.exports = router
