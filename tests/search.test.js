var app = require("../server");
var TEST_PORT = 3018;
async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT;
    var token = ""; var id = 0;
    try {
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})});
      var d = await r.json(); token = d.data.token;

      r = await fetch(BASE + "/api/articles", {method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer " + token}, body: JSON.stringify({title:"Node.js Learning", content:"Express and Node.js tutorial", summary:"Learn Node", tags:["Node.js"]})});
      d = await r.json(); id = d.data.id;
      await fetch(BASE + "/api/articles/" + id + "/publish", {method:"POST", headers:{"Authorization":"Bearer " + token}});

      r = await fetch(BASE + "/api/search?q=Node"); d = await r.json();
      if (!d.data.articles || d.data.articles.length === 0) throw new Error("search Node failed");
      console.log("1. Search Node.js: " + d.data.articles.length + " results");

      r = await fetch(BASE + "/api/search?q=Express"); d = await r.json();
      if (!d.data.articles || d.data.articles.length === 0) throw new Error("search Express failed");
      console.log("2. Search Express: " + d.data.articles.length + " results");

      r = await fetch(BASE + "/api/search?q=abcdefghij"); d = await r.json();
      if (d.data.articles.length !== 0) throw new Error("non-existent should be empty");
      console.log("3. Non-existent: 0 results");

      r = await fetch(BASE + "/api/search?q=Node"); d = await r.json();
      if (d.data.keyword !== "Node") throw new Error("keyword mismatch");
      console.log("4. Keyword preserved: " + d.data.keyword);

      await fetch(BASE + "/api/articles/" + id, {method:"DELETE", headers:{"Authorization":"Bearer " + token}});
      r = await fetch(BASE + "/api/search?q=Node"); d = await r.json();
      var stillThere = d.data.articles.some(function(a){return a.id === id});
      if (stillThere) throw new Error("FTS not deleted with article");
      console.log("5. FTS deleted with article (id " + id + " not in results): " + d.data.articles.length + " results remain");

      console.log("\nPASS: search.test.js");
    } catch(e) { console.error("FAIL:", e.message); process.exit(1); }
    finally { server.close(); }
  });
}
run();
