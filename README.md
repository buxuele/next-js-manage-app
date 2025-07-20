# Next.js 任务管理系统

一个简洁高效的任务管理工具，基于 Next.js 构建，专注于代码片段和任务的管理。

## 功能特点

- **任务管理**：添加、编辑、删除任务和代码片段
- **代码高亮**：支持多种编程语言的语法高亮显示
- **智能识别**：根据文件扩展名自动识别代码类型
- **数据导入导出**：支持任务数据的备份与恢复
- **用户认证**：基于 GitHub OAuth 的安全登录

## 技术栈

- Next.js 15.3.4
- TypeScript
- Bootstrap 5
- Neon Database (PostgreSQL)
- NextAuth.js
- Highlight.js

## 使用方法

1. 克隆仓库
2. 安装依赖：`npm install`
3. 配置环境变量（参考 .env.example）
4. 启动开发服务器：`npm run dev`
5. 构建生产版本：`npm run build`

## 环境配置

创建 `.env.local` 文件并配置以下变量：

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DATABASE_URL=your-neon-database-url
```

简洁美观的界面设计，让任务和代码片段管理变得轻松愉快！
