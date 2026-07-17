// Model 层测试文件
//
// 用途：独立验证 articleModel.js 的四个函数是否正常工作。
// 运行方式：node test-model.js

const Article = require('./models/articleModel')

console.log('--- Model 层测试开始 ---')

// 1. 创建测试文章
console.log('[1/4] 测试 createArticle...')
const id1 = Article.createArticle({
  title: '我的第一篇博客',
  content: '这是正文内容，可以包含多段文字。',
  summary: '这是文章摘要',
  tags: '生活,随笔'
})
const id2 = Article.createArticle({
  title: 'JavaScript 学习笔记',
  content: '今天学习了函数和数组。',
  summary: 'JS 基础学习记录',
  tags: '技术,JavaScript'
})
console.log('创建成功，ID:', id1, id2)

// 2. 按 ID 查询单篇文章
console.log('[2/4] 测试 getArticleById...')
const article1 = Article.getArticleById(id1)
console.log('文章标题:', article1.title)
console.log('文章标签:', article1.tags)

// 3. 获取全部文章（验证倒序排列）
console.log('[3/4] 测试 getAllArticles...')
const all = Article.getAllArticles()
console.log('文章总数:', all.length)
console.log('第一篇标题:', all[0].title)
console.log('第二篇标题:', all[1].title)

// 4. 删除文章
console.log('[4/4] 测试 deleteArticle...')
const deleted1 = Article.deleteArticle(id1)
const deleted2 = Article.deleteArticle(id2)
console.log('第一篇删除:', deleted1 ? '成功' : '失败')
console.log('第二篇删除:', deleted2 ? '成功' : '失败')

// 验证库里是否清空
const afterDelete = Article.getAllArticles()
console.log('删除后文章数:', afterDelete.length)

console.log('--- Model 层测试通过 ---')
