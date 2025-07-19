-- 端口管理应用数据库表结构 (Neon PostgreSQL)

-- 1. 创建用户表
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

-- 2. 创建项目表 (端口管理核心表)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    path TEXT NOT NULL,
    port INTEGER DEFAULT 3000,
    icon TEXT,
    is_running BOOLEAN DEFAULT FALSE,
    last_accessed BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 3. 保留 gists 表 (向后兼容)
CREATE TABLE IF NOT EXISTS gists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    filename TEXT NOT NULL DEFAULT 'untitled.txt',
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 4. 创建索引以提高查询性能

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 项目表索引
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_port ON projects(port);
CREATE INDEX IF NOT EXISTS idx_projects_is_running ON projects(is_running);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_last_accessed ON projects(last_accessed DESC);

-- Gists 表索引 (向后兼容)
CREATE INDEX IF NOT EXISTS idx_gists_user_id ON gists(user_id);
CREATE INDEX IF NOT EXISTS idx_gists_updated_at ON gists(updated_at DESC);