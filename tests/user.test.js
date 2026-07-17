var app = require("../server")
var TEST_PORT = 3020

async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT
    var token = "";
    try {
      // Login as admin
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})})
      var result = await r.json()
      token = result.data.token
      if (!token) throw new Error("login failed")
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
