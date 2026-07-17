 var db = require('../database/database')
 
 function create(params) {
   var stmt = db.prepare('INSERT INTO media (filename, original_name, path, mime_type, size) VALUES (?, ?, ?, ?, ?)')
   var result = stmt.run(params.filename, params.original_name, params.path, params.mime_type, params.size)
   return { id: result.lastInsertRowid, path: params.path }
 }
 
 function findAll() {
   return db.prepare('SELECT * FROM media ORDER BY created_at DESC').all()
 }
 
 function findById(id) {
   return db.prepare('SELECT * FROM media WHERE id = ?').get(id)
 }
 
 function deleteById(id) {
   return db.prepare('DELETE FROM media WHERE id = ?').run(id)
 }
 
 module.exports = { create, findAll, findById, deleteById }
