var marked = require("marked")
var jsdom = require("jsdom")
var window = (new jsdom.JSDOM("")).window
var DOMPurify = require("dompurify")(window)

var xssInput = "<script>alert(1)</script>"
var html = marked.parse(xssInput)
var clean = DOMPurify.sanitize(html)
if (clean.includes("<script>")) throw new Error("XSS not filtered")

var md = "# Hello\n\n**bold** and `code`"
html = marked.parse(md)
clean = DOMPurify.sanitize(html)
if (!clean.includes("Hello")) throw new Error("markdown broken by sanitize")
console.log("PASS: xss.test.js")
