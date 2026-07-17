var readingTime = require("../utils/articleUtils")

async function run() {
  try {
    // 1. Chinese content
    var zh = readingTime.calculateReadingTime("这是一篇中文文章用于测试阅读时间估算")
    if (zh.words < 1) throw new Error("Chinese word count failed: " + zh.words)
    if (zh.minutes < 1) throw new Error("Chinese minutes should be at least 1")
    console.log("1. Chinese: " + zh.words + " chars, " + zh.minutes + " min")

    // 2. English content
    var en = readingTime.calculateReadingTime("This is an English article for testing reading time estimation with several words")
    if (en.words < 1) throw new Error("English word count failed: " + en.words)
    if (en.minutes < 1) throw new Error("English minutes should be at least 1")
    console.log("2. English: " + en.words + " words, " + en.minutes + " min")

    // 3. Mixed content
    var mixed = readingTime.calculateReadingTime("中文标题\n\nThis is English paragraph")
    if (mixed.words < 1) throw new Error("Mixed word count: " + mixed.words)
    console.log("3. Mixed: " + mixed.words + " total, " + mixed.minutes + " min")

    // 4. Empty content
    var empty = readingTime.calculateReadingTime("")
    if (empty.words !== 0 || empty.minutes !== 0) throw new Error("Empty should be 0")
    console.log("4. Empty: " + empty.words + " words, " + empty.minutes + " min")

    // 5. Markdown stripped
    var md = readingTime.calculateReadingTime("# Title\n\n**bold** text\n\n- list\n\n```\ncode\n```")
    if (md.words < 1) throw new Error("MD word count: " + md.words)
    console.log("5. MD stripped: " + md.words + " words, " + md.minutes + " min")

    console.log("\nPASS: reading-time.test.js")
  } catch(e) {
    console.error("FAIL:", e.message)
    process.exit(1)
  }
}
run()
