# 🚀 Next.js 代码片段知识库

一个现代化的多用户代码片段管理平台，支持 GitHub OAuth 登录，让每个开发者都能拥有自己的私人代码知识库。

![应用截图](效果图/n1.png)

## 🌟 在线体验

**🔗 [https://next-js-gist-app.vercel.app](https://next-js-gist-app.vercel.app)**

使用你的 GitHub 账号即可登录，开始管理你的代码片段！

---

## ✨ 核心特性

### 🔐 多用户支持

- **GitHub OAuth 登录**: 使用 GitHub 账号一键登录，安全便捷
- **用户隔离**: 每个用户只能看到和管理自己的代码片段
- **自动用户管理**: 首次登录自动创建用户档案

### 📝 代码片段管理

- **完整的 CRUD 操作**:
  - ✅ **创建**: 通过模态框快速添加新代码片段
  - 👀 **查看**: 网格布局展示，支持独立详情页
  - ✏️ **编辑**: 在线编辑已有代码片段
  - 🗑️ **删除**: 安全删除不需要的片段
- **智能语法高亮**: 自动识别 20+ 种编程语言
- **文件类型检测**: 根据内容自动推测文件扩展名

### 🎨 用户体验

- **响应式设计**: 完美适配桌面、平板、手机
- **一键复制**: 快速复制代码到剪贴板
- **展开/收起**: 长代码智能折叠显示
- **实时搜索**: 快速找到需要的代码片段（即将推出）

### 🔧 技术亮点

- **现代化架构**: Next.js 15 + App Router
- **类型安全**: 全面的 TypeScript 支持
- **数据库**: PostgreSQL (Neon) 云数据库
- **认证**: NextAuth.js 企业级认证方案
- **部署**: Vercel 一键部署

---

## 🛠️ 技术栈

### 前端技术

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 库**: [React 19](https://react.dev/)
- **样式**: [Bootstrap 5](https://getbootstrap.com/) + 自定义 CSS
- **代码高亮**: [Highlight.js](https://highlightjs.org/)

### 后端技术

- **API**: Next.js API Routes
- **认证**: [NextAuth.js](https://next-auth.js.org/) + GitHub OAuth
- **数据库**: [PostgreSQL](https://www.postgresql.org/) ([Neon](https://neon.tech/))
- **ORM**: 原生 SQL 查询

### 开发工具

- **代码检查**: ESLint + TypeScript
- **部署**: [Vercel](https://vercel.com/)
- **版本控制**: Git + GitHub

---

## 🚀 快速开始

### 在线使用（推荐）

1. 访问 [https://next-js-gist-app.vercel.app](https://next-js-gist-app.vercel.app)
2. 点击 "使用 GitHub 登录"
3. 授权应用访问你的 GitHub 基本信息
4. 开始创建和管理你的代码片段！

### 本地开发

**前置要求**

- Node.js 18+
- npm 或 yarn
- GitHub OAuth 应用（用于认证）
- PostgreSQL 数据库（推荐使用 Neon）

**1. 克隆项目**

```bash
git clone https://github.com/buxuele/next-js-gist-app.git
cd next-js-gist-app
```

**2. 安装依赖**

```bash
npm install
```

**3. 环境配置**

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入以下配置：
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
DATABASE_URL=your-postgresql-connection-string
```

**4. 数据库设置**

```bash
# 在你的 PostgreSQL 数据库中执行
# database/schema.sql 中的 SQL 语句
npm run db:setup
```

**5. 启动开发服务器**

```bash
npm run dev
```

**6. 访问应用**
打开 [http://localhost:3000](http://localhost:3000)

---

## 📁 项目结构

```
next-js-gist-app/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── api/               # API 路由
│   │   ├── gist/[gist_id]/    # 代码片段详情页
│   │   ├── login/             # 登录页面
│   │   └── page.tsx           # 主页
│   ├── components/            # React 组件
│   │   ├── GistCard.tsx       # 代码片段卡片
│   │   ├── GistList.tsx       # 代码片段列表
│   │   └── GistModal.tsx      # 编辑模态框
│   ├── lib/                   # 工具库
│   │   ├── auth.ts            # 用户认证逻辑
│   │   ├── auth-config.ts     # NextAuth 配置
│   │   ├── data-neon.ts       # 数据库操作
│   │   └── utils.ts           # 工具函数
│   └── types/                 # TypeScript 类型定义
├── database/
│   └── schema.sql             # 数据库表结构
├── scripts/                   # 构建和部署脚本
└── public/                    # 静态资源
```

---

## 🔧 配置指南

### GitHub OAuth 应用设置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 设置回调 URL：
   - 本地开发: `http://localhost:3000/api/auth/callback/github`
   - 生产环境: `https://your-domain.com/api/auth/callback/github`

### 数据库配置

推荐使用 [Neon](https://neon.tech/) 作为 PostgreSQL 提供商：

1. 注册 Neon 账号
2. 创建新数据库
3. 获取连接字符串
4. 执行 `database/schema.sql` 中的建表语句

---

## 📊 功能演示

### 用户认证流程

1. **未登录状态** → 自动跳转到登录页
2. **GitHub OAuth** → 安全的第三方认证
3. **自动注册** → 首次登录自动创建用户档案
4. **会话管理** → JWT token 安全会话

### 代码片段管理

1. **创建片段** → 模态框表单，支持语法检测
2. **查看列表** → 网格布局，语法高亮预览
3. **编辑更新** → 在线编辑，实时保存
4. **安全删除** → 确认删除，防止误操作

---

## 🚀 部署指南

### Vercel 部署（推荐）

1. Fork 本项目到你的 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量
4. 自动部署完成

### 环境变量配置

```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-32-character-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
DATABASE_URL=postgresql://user:pass@host:port/db
```

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 开发日志

- **v2.0.0** - 多用户支持，GitHub OAuth 登录
- **v1.5.0** - 数据库集成，云端存储
- **v1.0.0** - 基础功能，本地文件存储

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [NextAuth.js](https://next-auth.js.org/) - 简单易用的认证库
- [Neon](https://neon.tech/) - 现代化的 PostgreSQL 服务
- [Vercel](https://vercel.com/) - 优秀的部署平台
- [Highlight.js](https://highlightjs.org/) - 代码语法高亮

---

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 🐛 [提交 Issue](https://github.com/buxuele/next-js-gist-app/issues)
- 💡 [功能建议](https://github.com/buxuele/next-js-gist-app/discussions)
- 📧 Email: [your-email@example.com]

---

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**
