# Next.js 项目管理系统

一个简洁高效的项目管理工具，基于 Next.js 构建，专注于开发项目的统一管理和快速访问。

## 功能特点

- **项目管理**：添加、编辑、删除开发项目
- **状态监控**：实时检测项目在线状态
- **快速访问**：一键打开项目目录或访问项目网址
- **数据导入导出**：支持项目数据的备份与恢复
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

简洁美观的界面设计，让开发项目管理变得轻松愉快！
