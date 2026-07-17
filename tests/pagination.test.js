var app = require("../server");
var TEST_PORT = 3013;
async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT;
    var token = "";
    try {
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})});
      var result = await r.json(); token = result.data.token;

      var ids = [];
      for (var i = 0; i < 5; i++) {
        r = await fetch(BASE + "/api/articles", {method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer " + token}, body: JSON.stringify({title:"Test " + i, content:"C" + i})});
        result = await r.json(); ids.push(result.data.id);
      }
      for (var i = 0; i < 3; i++) {
        await fetch(BASE + "/api/articles/" + ids[i] + "/publish", {method:"POST", headers:{"Authorization":"Bearer " + token}});
      }

      r = await fetch(BASE + "/api/articles?page=1&limit=2");
      result = await r.json();
      console.log("1. Page=1:", result.data.articles.length, "articles");

      r = await fetch(BASE + "/api/articles?page=2&limit=2");
      result = await r.json();
      console.log("2. Page=2:", result.data.articles.length, "articles, pages:", result.data.pagination.totalPages);

      r = await fetch(BASE + "/api/articles?limit=50", {headers:{"Authorization":"Bearer " + token}});
      result = await r.json();
      console.log("3. Admin all:", result.data.articles.length, "articles");

      r = await fetch(BASE + "/api/articles?status=draft&limit=50", {headers:{"Authorization":"Bearer " + token}});
      result = await r.json();
      console.log("4. Drafts:", result.data.articles.length, "articles");

      for (var i = 0; i < ids.length; i++) {
        await fetch(BASE + "/api/articles/" + ids[i], {method:"DELETE", headers:{"Authorization":"Bearer " + token}});
      }
      console.log("\nPASS: pagination.test.js");
    } catch(e) {
      console.error("FAIL:", e.message);
      process.exit(1);
    } finally { server.close(); }
  });
}
run();
