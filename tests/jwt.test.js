var app = require("../server")
var jwt = require("jsonwebtoken")
var TEST_PORT = 3021

async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT
    try {
      // Login to get a valid JWT
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})})
      var result = await r.json()
      var token = result.data.token

      // Verify token structure (JWT has 3 parts separated by dots)
      var parts = token.split(".")
      if (parts.length !== 3) throw new Error("JWT should have 3 parts, got " + parts.length)
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
