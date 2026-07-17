# 基于 Node.js 24 的 Alpine 镜像（体积小、安全）
FROM node:24-alpine

# 设置工作目录
WORKDIR /app

# 先复制依赖描述文件，利用 Docker 缓存层
COPY package*.json ./

# 安装生产依赖（不安装 devDependencies）
RUN npm install --production

# 复制源代码（.dockerignore 已排除 node_modules、data 等）
COPY . .

# 创建数据目录（运行时挂载持久卷）
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
