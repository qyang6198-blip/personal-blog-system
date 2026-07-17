var app = require("../server")
var TEST_PORT = 3009

async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT
    try {
      // GET /api/health
      var r = await fetch(BASE + "/api/health")
      if (r.status !== 200) throw new Error("health failed")

      // GET /api/articles
      r = await fetch(BASE + "/api/articles")
      var result = await r.json()
      var isOk = Array.isArray(result.data) || (result.data.articles && Array.isArray(result.data.articles)); if (!isOk) throw new Error("articles format wrong")

      // Login
      r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})})
      result = await r.json()
      var token = result.data ? result.data.token : null
      if (!token) throw new Error("login failed")

      // POST article without auth
      r = await fetch(BASE + "/api/articles", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({title:"t", content:"c"})})
      if (r.status !== 401) throw new Error("auth guard failed")

      // POST article with auth
      r = await fetch(BASE + "/api/articles", {method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer " + token}, body: JSON.stringify({title:"test", content:"test content"})})
      result = await r.json()
      var id = result.data ? result.data.id : null
      if (!id) throw new Error("create article failed")

      // DELETE
      r = await fetch(BASE + "/api/articles/" + id, {method:"DELETE", headers:{"Authorization":"Bearer " + token}})
      if (r.status !== 200) throw new Error("delete failed")

      console.log("PASS: api.test.js")
    } catch(e) {
      console.error("FAIL:", e.message)
      process.exit(1)
    } finally {
      server.close()
    }
  })
}
run()
