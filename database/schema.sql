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
CREATE INDEX IF NOT EXISTS idx_gists_created_at ON gists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gists_filename ON gists(filename);