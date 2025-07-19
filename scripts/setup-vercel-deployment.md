# Vercel 部署配置指南

## 1. 在 Vercel 控制台设置环境变量

访问：https://vercel.com/your-username/next-js-manage-app/settings/environment-variables

添加以下环境变量：

### NextAuth.js 配置

```
NEXTAUTH_URL=https://next-js-manage-app.vercel.app
NEXTAUTH_SECRET=bXPqzatfgROYWESeejzgq4bZyejh+sFAHIXTLxHMzWI=
```

### GitHub OAuth 配置

```
GITHUB_CLIENT_ID=Ov23liogU46ob0taXqKT
GITHUB_CLIENT_SECRET=989c3608a406e7b0ec7961bcf5c7f5a98935baf0
```

### Neon 数据库配置

```
DATABASE_URL=postgres://neondb_owner:npg_c9pr5mCEXKyo@ep-orange-salad-a1pgo0jh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgres://neondb_owner:npg_c9pr5mCEXKyo@ep-orange-salad-a1pgo0jh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

## 2. 数据库初始化

运行以下脚本来初始化数据库表：

```bash
npm run setup-database
```

## 3. GitHub OAuth 应用配置

在 GitHub OAuth 应用设置中，确保：

- Homepage URL: `https://next-js-manage-app.vercel.app`
- Authorization callback URL: `https://next-js-manage-app.vercel.app/api/auth/callback/github`

## 4. 重新部署

设置完环境变量后，触发重新部署：

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```
