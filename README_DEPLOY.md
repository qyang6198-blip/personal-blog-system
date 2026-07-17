 # 博客系统部署指南
 
 ## 环境要求
 - Node.js >= 18
 - npm >= 8
 
 ## 快速开始
 ```bash
 # 1. 安装依赖
 npm install
 
 # 2. 配置环境变量
 cp .env.example .env
 # 编辑 .env 文件，修改 JWT_SECRET
 
 # 3. 启动服务器
 npm start
 ```
 
 ## 生产部署
 ```bash
 # 设置生产环境
 set NODE_ENV=production
 
 # 使用 PM2（推荐）
 npm install -g pm2
 pm2 start server.js --name blog
 pm2 save
 pm2 startup
 
 # 或使用 nohup
 nohup node server.js > output.log 2>&1 &
 ```
 
 ## 数据库
 - SQLite 数据库文件位于 `data/blog.sqlite`
 - 首次启动自动创建表和默认管理员
 - 备份：`npm run backup`
 
 ## 目录结构
 ```
 blog/
 ├── controllers/    # 路由控制器
 ├── database/       # 数据库连接和迁移
 ├── middleware/     # Express 中间件
 ├── models/        # 数据模型
 ├── public/        # 前端静态文件
 │   ├── css/
 │   ├── js/
 │   └── uploads/
 ├── routes/        # 路由定义
 ├── tests/         # 测试文件
 └── utils/         # 工具函数
 ```
 
 ## 默认账号
 - 用户名: admin
 - 密码: 123456
 （请在 .env 中修改）
 
 ## API 文档
 完整 API 文档请参考源码中的 controller 和 route 文件。
