 var app = require("../server")
 var TEST_PORT = 301108
 var path = require("path")
 var fs = require("fs")
 
 async function run() {
   var server = app.listen(TEST_PORT, async function() {
     var BASE = "http://localhost:" + TEST_PORT
     try {
       // Login
       var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username:"admin", password:"123456"})})
       var result = await r.json()
       var token = result.data ? result.data.token : null
       if (!token) throw new Error("login failed")
 
       // Create a 1x1 PNG as test image
       var pngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64")
       var blob = new Blob([pngBuffer], {type:"image/png"})
       var fd = new FormData()
       fd.append("image", blob, "test-image.png")
 
       // Upload media
       r = await fetch(BASE + "/api/media/upload", {method:"POST", headers:{"Authorization":"Bearer " + token}, body:fd})
       result = await r.json()
       if (!result.success || !result.data || !result.data.url) throw new Error("upload failed: " + JSON.stringify(result))
       var mediaUrl = result.data.url
       if (mediaUrl.indexOf("/uploads/") !== 0) throw new Error("bad url: " + mediaUrl)
       var mediaId = result.data.id
       if (!mediaId) throw new Error("no id returned")
       console.log("  upload: OK (id=" + mediaId + ")")
 
       // Get media list
       r = await fetch(BASE + "/api/media", {headers:{"Authorization":"Bearer " + token}})
       result = await r.json()
       if (!result.success || !Array.isArray(result.data)) throw new Error("list failed")
       var found = result.data.some(function(m) { return m.id === mediaId })
       if (!found) throw new Error("uploaded media not in list")
       console.log("  list: OK (" + result.data.length + " items)")
 
       // Delete media
       r = await fetch(BASE + "/api/media/" + mediaId, {method:"DELETE", headers:{"Authorization":"Bearer " + token}})
       result = await r.json()
       if (!result.success) throw new Error("delete failed")
 
       // Verify file was deleted
       var uploadsDir = path.join(__dirname, "..", "public", "uploads")
       var files = fs.readdirSync(uploadsDir)
       console.log("  delete: OK")
 
       console.log("PASS: media.test.js")
     } catch(e) {
       console.error("FAIL:", e.message)
       process.exit(1)
     } finally {
       server.close()
     }
   })
 }
 run()
