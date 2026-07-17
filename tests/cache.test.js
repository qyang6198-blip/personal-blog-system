var cache = require("../utils/cache")

async function run() {
  try {
    // Set a value
    cache.set("test-key", { hello: "world" })
    var val = cache.get("test-key")
    if (!val || val.hello !== "world") throw new Error("cache set/get failed")
    console.log("PASS")
  } catch(e) {
    console.error("FAIL:", e.message)
    process.exit(1)
  }
}
run()
