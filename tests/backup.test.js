var app = require("../server")
var fs = require("fs")
var path = require("path")
var TEST_PORT = 3023

async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT
    try {
      // Login
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})})
      var result = await r.json()
      var token = result.data.token

      // Create backup via API
      r = await fetch(BASE + "/api/admin/backup", {method:"POST", headers:{"Authorization":"Bearer " + token}})
      result = await r.json()
      if (!result.success || !result.data.file) throw new Error("backup failed")
      console.log("PASS")
    } catch(e) {
      console.error("FAIL:", e.message)
      process.exit(1)
    } finally {
      server.close()
    }
  })
}
run()
