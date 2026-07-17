var app = require("../server");
var TEST_PORT = 3015;
async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT;
    try {
      var res = await fetch(BASE + "/sitemap.xml");
      var xml = await res.text();
      var ct = res.headers.get("content-type") || "";
      if (ct.indexOf("xml") === -1) throw new Error("wrong content-type: " + ct);
      if (xml.indexOf("<urlset") === -1) throw new Error("not sitemap");
      if (xml.indexOf("<loc>") === -1) throw new Error("no urls");
      if (xml.indexOf("article.html?id=") === -1) throw new Error("no article urls");
      console.log("PASS: sitemap.test.js");
    } catch(e) {
      console.error("FAIL:", e.message);
      process.exit(1);
    } finally { server.close(); }
  });
}
run();
