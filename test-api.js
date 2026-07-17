// API 层测试文件
//
// 用途：验证四个文章 API 是否正常工作。
// 测试流程：
//   1. 用 test 端口启动服务器
//   2. 按顺序发送 HTTP 请求测试每个 API
//   3. 测试完成后关闭服务器
//
// 运行方式：node test-api.js

const app = require('./server')

// 使用 3001 端口，避免和正在运行的 server.js（3000）冲突
const TEST_PORT = 3001

async function runTests() {
  const server = app.listen(TEST_PORT, async () => {
    console.log('--- API 层测试开始 ---')
    const BASE = 'http://localhost:' + TEST_PORT

    try {
      // 1. 测试 GET /api/articles（空列表）
      console.log('[1/5] GET /api/articles（空列表）...')
      let res = await fetch(BASE + '/api/articles')
      let data = await res.json()
      console.log('  ', '状态码:', res.status)
      console.log('  ', '文章数:', data.length)

      // 2. 测试 POST /api/articles（创建两篇文章）
      console.log('[2/5] POST /api/articles（创建文章）...')
      res = await fetch(BASE + '/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '我的第一篇博客',
          content: '这是正文内容。',
          summary: '摘要',
          tags: '生活'
        })
      })
      data = await res.json()
      const id1 = data.id
      console.log('  ', '状态码:', res.status, '| ID:', id1)

      res = await fetch(BASE + '/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '第二篇文章',
          content: '另一篇正文。',
          summary: '',
          tags: '技术'
        })
      })
      data = await res.json()
      const id2 = data.id
      console.log('  ', '状态码:', res.status, '| ID:', id2)

      // 3. 测试 GET /api/articles（确认有2篇）
      console.log('[3/5] GET /api/articles（列表验证）...')
      res = await fetch(BASE + '/api/articles')
      data = await res.json()
      console.log('  ', '状态码:', res.status, '| 文章数:', data.length)

      // 4. 测试 GET /api/articles/:id（获取单篇）
      console.log('[4/5] GET /api/articles/:id（详情验证）...')
      res = await fetch(BASE + '/api/articles/' + id1)
      data = await res.json()
      console.log('  ', '状态码:', res.status, '| 标题:', data.title)

      // 测试不存在的文章返回 404
      res = await fetch(BASE + '/api/articles/999')
      console.log('  ', '不存在的文章 -> 状态码:', res.status)

      // 5. 测试 DELETE /api/articles/:id
      console.log('[5/5] DELETE /api/articles/:id...')
      res = await fetch(BASE + '/api/articles/' + id1, { method: 'DELETE' })
      console.log('  ', '删除成功 -> 状态码:', res.status)

      // 测试重复删除返回 404
      res = await fetch(BASE + '/api/articles/' + id1, { method: 'DELETE' })
      console.log('  ', '重复删除 -> 状态码:', res.status)

      // 清理：删除第二篇文章
      await fetch(BASE + '/api/articles/' + id2, { method: 'DELETE' })

      console.log('--- API 层测试通过 ---')
    } catch (err) {
      console.error('测试失败:', err.message)
    } finally {
      server.close()
      console.log('服务器已关闭')
    }
  })
}

runTests()
