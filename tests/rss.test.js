var app = require("../server");
var TEST_PORT = 3014;
async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT;
    try {
      var res = await fetch(BASE + "/rss.xml");
      var xml = await res.text();
      var ct = res.headers.get("content-type") || "";
      if (ct.indexOf("xml") === -1) throw new Error("wrong content-type: " + ct);
      if (xml.indexOf("<rss") === -1) throw new Error("not rss");
      if (xml.indexOf("<item>") === -1) throw new Error("no items");
      console.log("PASS: rss.test.js");
    } catch(e) {
      console.error("FAIL:", e.message);
      process.exit(1);
    } finally { server.close(); }
  });
}
run();
