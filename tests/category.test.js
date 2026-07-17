var app = require("../server");
var TEST_PORT = 3017;
async function run() {
  var server = app.listen(TEST_PORT, async function() {
    var BASE = "http://localhost:" + TEST_PORT;
    var token = ""; var catId = 0; var artId = 0;
    try {
      var r = await fetch(BASE + "/api/login", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({username:"admin", password:"123456"})});
      var d = await r.json(); token = d.data.token;

      var db = require("../database/database");
      db.prepare("INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)").run("TestCat", "testcat");
      catId = db.prepare("SELECT id FROM categories WHERE slug = ?").get("testcat").id;
      console.log("1. Category created: ID", catId);

      r = await fetch(BASE + "/api/articles", {method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer " + token}, body: JSON.stringify({title:"Cat Test", content:"Test", category_id: catId})});
      d = await r.json(); artId = d.data.id;
      console.log("2. Article created with category, ID:", artId);

      r = await fetch(BASE + "/api/categories"); d = await r.json();
      var cats = d.data.filter(function(c){return c.name === "TestCat"});
      if (cats.length === 0) throw new Error("category not found");
      console.log("3. GET /api/categories: OK (" + d.data.length + " cats)");

      r = await fetch(BASE + "/api/categories/testcat/articles"); d = await r.json();
      if (!Array.isArray(d.data) || d.data.length === 0) throw new Error("no articles for category");
      console.log("4. Articles by category: " + d.data.length + " articles");

      r = await fetch(BASE + "/api/articles/" + artId, {headers:{"Authorization":"Bearer " + token}});
      d = await r.json();
      if (!d.data.category || d.data.category.name !== "TestCat") throw new Error("category not in article detail");
      console.log("5. Article detail has category: OK (" + d.data.category.name + ")");

      r = await fetch(BASE + "/api/categories/nonexistent-slug-999/articles"); d = await r.json();
      if (d.data.length !== 0) throw new Error("non-existent should be empty");
      console.log("6. Non-existent slug: empty OK");

      // 使用 API 删除（自动处理关联表清理）
      await fetch(BASE + "/api/articles/" + artId, {method:"DELETE", headers:{"Authorization":"Bearer " + token}});
      // 清除该分类下所有文章的关联，避免外键约束冲突
      db.prepare("UPDATE articles SET category_id = NULL WHERE category_id = ?").run(catId);
      db.prepare("DELETE FROM categories WHERE id = ?").run(catId);
      console.log("\nPASS: category.test.js");
    } catch(e) { console.error("FAIL:", e.message); process.exit(1); }
    finally { server.close(); }
  });
}
run();
