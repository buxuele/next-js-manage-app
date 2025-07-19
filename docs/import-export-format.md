# 项目配置导入导出格式说明

## 导出格式

导出的 JSON 文件包含以下结构：

```json
{
  "version": "1.0",
  "exportTime": "2024-01-20T10:30:00.000Z",
  "projects": [
    {
      "name": "我的 Next.js 项目",
      "description": "一个基于 Next.js 的 Web 应用",
      "path": "D:\\projects\\my-nextjs-app",
      "port": 3000,
      "icon": "/project-icons/nextjs.png"
    },
    {
      "name": "React 管理后台",
      "description": "基于 React 的管理系统",
      "path": "D:\\projects\\react-admin",
      "port": 3001,
      "icon": "/project-icons/react.png"
    }
  ]
}
```

## 字段说明

### 根级别字段

- `version`: 导出格式版本号
- `exportTime`: 导出时间（ISO 8601 格式）
- `projects`: 项目配置数组

### 项目字段

- `name` (必需): 项目名称
- `description` (可选): 项目描述
- `path` (必需): 项目本地路径
- `port` (可选): 开发服务器端口，默认为 3000
- `icon` (可选): 项目图标路径

## 导入规则

1. **必需字段验证**: `name` 和 `path` 是必需的
2. **重复处理**: 如果导入的项目名称或路径已存在，会创建新的项目记录
3. **错误处理**: 无效的项目配置会被跳过，不会影响其他项目的导入
4. **端口默认值**: 如果未指定端口，默认使用 3000

## 使用方法

### 导出

1. 在项目管理页面点击"更多"按钮
2. 选择"导出配置"
3. 文件会自动下载，文件名格式：`projects-export-YYYY-MM-DD.json`

### 导入

1. 在项目管理页面点击"更多"按钮
2. 选择"导入配置"
3. 选择符合格式的 JSON 文件
4. 系统会显示导入结果（成功/失败数量）

## 注意事项

- 导出功能只在有项目时可用
- 导入会将新项目添加到现有项目列表中，不会覆盖现有项目
- 建议在导入前备份现有配置
- 文件大小建议不超过 10MB
