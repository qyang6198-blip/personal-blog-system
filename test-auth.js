// 认证系统测试文件
//
// 测试流程：
//   1. 错误账号密码 → 401
//   2. 正确账号密码 → 200 + token
//   3. 不携token发布 → 401
//   4. 携正确token发布 → 201
//   5. 清理测试数据
//
// 运行方式：node test-auth.js

const app = require('./server')
const TEST_PORT = 3002

async function runTests() {
  var server = app.listen(TEST_PORT, async function () {
    var BASE = 'http://localhost:' + TEST_PORT
    var token = ''
    var articleId = -1

    console.log('--- 认证系统测试开始 ---')

    try {
      // 1. 错误账号密码登录
      console.log('[1/4] 错误账号密码登录...')
      var res = await fetch(BASE + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'wrong' })
      })
      console.log('  ', '状态码:', res.status, '(期望 401)')

      // 2. 正确账号密码登录
      console.log('[2/4] 正确账号密码登录...')
      res = await fetch(BASE + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: '123456' })
      })
      var data = await res.json()
      token = data.token
      console.log('  ', '状态码:', res.status, '(期望 200)')
      console.log('  ', 'token:', token ? '获得（长度' + token.length + '）' : '失败')

      // 3. 不携带 token 发布文章
      console.log('[3/4] 不携带 token 发布文章...')
      res = await fetch(BASE + '/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '测试', content: '测试' })
      })
      console.log('  ', '状态码:', res.status, '(期望 401)')

      // 4. 携带正确 token 发布文章
      console.log('[4/4] 携带正确 token 发布文章...')
      res = await fetch(BASE + '/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ title: '认证测试文章', content: '通过认证发布的文章' })
      })
      data = await res.json()
      articleId = data.id
      console.log('  ', '状态码:', res.status, '(期望 201)')
      console.log('  ', '文章ID:', articleId)

      // 清理测试数据
      if (articleId > 0) {
        await fetch(BASE + '/api/articles/' + articleId, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        })
        console.log('  测试数据已清理')
      }

      console.log('--- 认证系统测试通过 ---')
    } catch (err) {
      console.error('测试失败:', err.message)
    } finally {
      server.close()
      console.log('服务器已关闭')
    }
  })
}

runTests()
