 var express = require('express')
 var router = express.Router()
 var authMiddleware = require('../middleware/authMiddleware')
 var versionController = require('../controllers/versionController')
 
 router.get('/articles/:id/versions', authMiddleware, versionController.getVersions)
 router.get('/articles/:id/versions/:versionId', authMiddleware, versionController.getVersion)
 router.post('/articles/:id/versions/:versionId/restore', authMiddleware, versionController.restoreVersion)
 router.post('/articles/:id/versions/snapshot', authMiddleware, versionController.createSnapshot)
 router.get('/articles/:id/versions/:v1/diff/:v2', authMiddleware, versionController.diffVersions)
 
 module.exports = router
