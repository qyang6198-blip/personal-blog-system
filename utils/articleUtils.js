// 文章工具函数
//
// 职责：
//   提供与文章相关的通用工具函数，如阅读时间估算。
//
// 为什么单独放在 utils/ 而不是 controller 或 model？
//   calculateReadingTime 是一个纯计算函数，不涉及 HTTP 请求也不涉及数据库。
//   放在 utils/ 让 controller 和 model 都能使用，职责更清晰。

/**
 * 估算文章阅读时间
 *
 * 输入：content - 文章正文（Markdown 纯文本）
 * 输出：{ words: Number, minutes: Number }
 *
 * 算法说明：
 *   中文阅读速度约每分钟 400 字
 *   英文阅读速度约每分钟 200 单词
 *   混合内容分别统计再汇总
 *
 * 为什么这样算：
 *   去掉 Markdown 标记（#, *, -,  等）避免干扰计数
 *   中文字符逐个计数，英文单词按空格拆分
 */
function calculateReadingTime(content) {
  if (!content || typeof content !== 'string') {
    return { words: 0, minutes: 0 }
  }

  // 去掉 Markdown 语法符号，只保留纯文本
  var text = content
    .replace(/```[\s\S]*?```/g, '')     // 去掉代码块
    .replace(/`[^`]+`/g, '')             // 去掉行内代码
    .replace(/#{1,6}\s+/g, '')           // 去掉标题标记
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')  // 去掉粗体/斜体
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // 链接只保留文字
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')    // 去掉图片
    .replace(/[>|]/g, '')                      // 去掉引用和表格线

  // 统计中文字符（Unicode 范围：\u4e00-\u9fff）
  var chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length

  // 统计英文单词（去掉中文字符后，按空白拆分）
  var englishText = text.replace(/[\u4e00-\u9fff]/g, ' ')
  var englishWords = englishText.split(/\s+/).filter(function(w) { return w.length > 0 }).length

  var totalWords = chineseChars + englishWords

  // 中文 400 字/分钟，英文 200 词/分钟
  var chineseMinutes = chineseChars / 400
  var englishMinutes = englishWords / 200

  var totalMinutes = Math.ceil(chineseMinutes + englishMinutes) || 1

  return {
    words: totalWords,
    minutes: totalMinutes
  }
}

module.exports = {
  calculateReadingTime
}