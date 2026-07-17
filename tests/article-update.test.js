var app = require("../server")
var TEST_PORT = 3010

async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT
    try {
      // Login
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})})
      var result = await r.json()
      var token = result.data.token

      // Create test article
      r = await fetch(BASE + "/api/articles", {method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer " + token}, body: JSON.stringify({title:"Update Test", content:"Before update"})})
      result = await r.json()
      var id = result.data.id

      // Update
      r = await fetch(BASE + "/api/articles/" + id, {method:"PUT", headers:{"Content-Type":"application/json","Authorization":"Bearer " + token}, body: JSON.stringify({title:"Updated Title", content:"After update", summary:"new summary", tags:"test"})})
      result = await r.json()
      if (r.status !== 200 || !result.data) throw new Error("update failed")

      // Verify
      r = await fetch(BASE + "/api/articles/" + id, { headers: { "Authorization": "Bearer " + token } })
      result = await r.json()
      if (result.data.title !== "Updated Title") throw new Error("update not applied")

      // Cleanup
      r = await fetch(BASE + "/api/articles/" + id, {method:"DELETE", headers:{"Authorization":"Bearer " + token}})

      // PUT no auth
      r = await fetch(BASE + "/api/articles/1", {method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({title:"x", content:"x"})})
      if (r.status !== 401) throw new Error("put auth guard failed")

      console.log("PASS: article-update.test.js")
    } catch(e) {
      console.error("FAIL:", e.message)
      process.exit(1)
    } finally {
      server.close()
    }
  })
}
run()
