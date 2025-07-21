# 开发模式配置说明

## 概述

为了方便本地开发，项目支持两种登录模式：

1. **开发模式**：本地开发时使用，无需 GitHub 认证
2. **生产模式**：部署到云端时使用，需要 GitHub 认证

## 配置方法

### 本地开发模式

在 `.env.local` 文件中设置：

```env
NODE_ENV=development
DEV_MODE=true
NEXT_PUBLIC_DEV_MODE=true
NEXTAUTH_URL=http://localhost:3000
```

### 生产环境模式

在 Vercel 环境变量中设置：

```env
NODE_ENV=production
DEV_MODE=false
NEXTAUTH_URL=https://your-app.vercel.app
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 使用说明

### 本地开发

1. 确保 `.env.local` 中设置了开发模式
2. 运行 `npm run dev`
3. 访问 `http://localhost:3000/login`
4. 点击"开发模式登录"按钮即可登录
5. 系统会自动创建一个开发用户账号

### 生产环境

1. 在 Vercel 中设置生产环境变量
2. 部署应用
3. 访问登录页面会显示 GitHub 登录按钮
4. 需要通过 GitHub OAuth 进行认证

## 开发用户信息

开发模式下会自动创建以下用户：

- ID: `dev-user-1`
- 用户名: `developer`
- 邮箱: `dev@localhost.com`
- 显示名: `开发用户`

## 注意事项

1. 开发模式仅在本地环境使用，不要在生产环境启用
2. 开发用户的数据会保存在数据库中
3. 切换到生产模式时，开发用户数据仍然存在，但无法通过 GitHub 登录访问
4. 如需清理开发数据，可以手动删除数据库中的开发用户记录
