# Vercel 部署 
  

### 第一步：在 Vercel 控制台设置环境变量

```bash
# NextAuth.js 配置
NEXTAUTH_URL= 

# GitHub OAuth 配置
GITHUB_CLIENT_ID 
GITHUB_CLIENT_SECRET= 
```

### 第二步：初始化数据库表

在本地运行以下命令来创建数据库表：

```bash
npm run setup-database
```

或者直接在 Neon 控制台执行 `database/schema.sql` 中的 SQL 语句。

### 第三步：更新 GitHub OAuth 应用设置

- https://next-js-manage-app.vercel.app
- https://next-js-manage-app.vercel.app/api/auth/callback/github

### 第四步：重新部署

设置完环境变量后，触发重新部署：

```bash
git add .
git commit -m "Fix deployment configuration"
git push
```

### 第五步：调试和验证

部署完成后，访问以下页面进行调试：

1. **调试页面**: https://next-js-manage-app.vercel.app/debug
2. **数据库测试**: https://next-js-manage-app.vercel.app/api/debug/database
3. **Session API**: https://next-js-manage-app.vercel.app/api/auth/session

 