var app = require("../server")
var hashUtil = require("../utils/hash")
var TEST_PORT = 3019

async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT
    var token = "";
    try {
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})})
      var result = await r.json()
      token = result.data.token

      var h1 = hashUtil.getVisitorHash("192.168.1.1", "Chrome/120")
      var h2 = hashUtil.getVisitorHash("192.168.1.1", "Chrome/120")
      if (h1 !== h2) throw new Error("Hash should be same for same IP+UA")
      console.log("1. Same IP+UA => same hash: OK")

      var h3 = hashUtil.getVisitorHash("192.168.1.1", "Firefox/120")
      if (h1 === h3) throw new Error("Hash should differ for different UA")
      console.log("2. Different UA => different hash: OK")

      r = await fetch(BASE + "/api/visits", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({article_id: 1})})
      if (r.status !== 201) throw new Error("Visit record failed")
      console.log("3. Record visit: OK")

      r = await fetch(BASE + "/api/stats/detail", {headers:{"Authorization":"Bearer " + token}})
      result = await r.json()
      if (!result.success || !result.data || typeof result.data.pv !== "number") throw new Error("Stats detail format wrong")
      console.log("4. Stats detail: PV=" + result.data.pv + ", UV=" + result.data.uv + ", rows=" + result.data.daily.length)

      r = await fetch(BASE + "/api/stats/detail")
      if (r.status !== 401) throw new Error("Stats detail auth guard failed")
      console.log("5. Stats detail auth guard: OK")

      console.log("\nPASS: uv.test.js")
    } catch(e) {
      console.error("FAIL:", e.message)
      process.exit(1)
    } finally {
      server.close()
    }
  })
}
run()
