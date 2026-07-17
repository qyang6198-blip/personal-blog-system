var app = require("../server");
var TEST_PORT = 3016;
async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT;
    var token = "";
    try {
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})});
      var d = await r.json(); token = d.data.token;

      r = await fetch(BASE + "/api/tags"); d = await r.json();
      if (!Array.isArray(d.data)) throw new Error("tags not array");
      console.log("1. GET /api/tags returns array:", d.data.length, "tags");

      r = await fetch(BASE + "/api/articles", {method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer " + token}, body: JSON.stringify({title:"Tag Test", content:"Test", tags: ["TestTag1", "TestTag2"]})});
      d = await r.json(); var id = d.data.id;

      r = await fetch(BASE + "/api/tags"); d = await r.json();
      var names = d.data.map(function(t){return t.name});
      if (names.indexOf("TestTag1") === -1) throw new Error("tag not created");
      console.log("2. Tag persisted via article creation: OK");

      r = await fetch(BASE + "/api/tags/TestTag1/articles"); d = await r.json();
      if (!Array.isArray(d.data) || d.data.length === 0) throw new Error("no articles for tag");
      console.log("3. Articles by tag:", d.data.length, "articles");

      r = await fetch(BASE + "/api/tags/NonExistentTag999/articles"); d = await r.json();
      if (d.data.length !== 0) throw new Error("non-existent tag should be empty");
      console.log("4. Non-existent tag returns empty: OK");

      r = await fetch(BASE + "/api/articles/" + id, {headers:{"Authorization":"Bearer " + token}});
      d = await r.json();
      if (!Array.isArray(d.data.tags) || d.data.tags.indexOf("TestTag1") === -1) throw new Error("tags not array in article detail");
      console.log("5. Article detail returns tags as array: OK");

      await fetch(BASE + "/api/articles/" + id, {method:"DELETE", headers:{"Authorization":"Bearer " + token}});
      console.log("\nPASS: tag-page.test.js");
    } catch(e) { console.error("FAIL:", e.message); process.exit(1); }
    finally { server.close(); }
  });
}
run();
