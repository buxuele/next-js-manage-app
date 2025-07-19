#   GitHub OAuth 登录设置指南

### 1. 创建 GitHub OAuth 应用

https://github.com/settings/developers
  
   
   Application name: 我的知识库
   Homepage URL: https://next-js-gist-app.vercel.app/
   Application description: 个人代码片段管理工具

   Authorization callback URL: 
   https://next-js-manage-app.vercel.app/api/auth/callback/github

   **本地开发时的回调 URL**：
   http://localhost:3000/api/auth/callback/github
   

4. **点击 "Register application"**

5. **获取 Client ID 和 Client Secret**：

### 2. 配置环境变量
2. **编辑 `.env.local` 文件**：

3. **生成 NEXTAUTH_SECRET**：
   > openssl rand -base64 32 

#### Vercel 生产环境配置

1. **在 Vercel Dashboard 中设置环境变量**：
  https://vercel.com/fanchuangs-projects/next-js-gist-app/settings/environment-variables

   - 进入项目设置 → Environment Variables
   - 添加以下变量： 注意有些变量已经存在了！！！

   ```
   NEXTAUTH_URL=https://next-js-gist-app.vercel.app/
   NEXTAUTH_SECRET= 
   GITHUB_CLIENT_ID= 
   GITHUB_CLIENT_SECRET= 
   ```

### 3. 更新数据库表结构

在 Neon Console 中执行以下 SQL：
注意，  sql 里面不要写中文注释！！！！ 否则报错无法执行！！！


```sql

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_id INTEGER UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    name VARCHAR(255),
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);


DROP TABLE IF EXISTS gists;
CREATE TABLE gists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    filename TEXT NOT NULL DEFAULT 'untitled.txt',
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_gists_user_id ON gists(user_id);
CREATE INDEX IF NOT EXISTS idx_gists_updated_at ON gists(updated_at DESC);
```

### 4. 测试登录功能

npm install next-auth
 