# Kooboo 项目同步工具
> 本地化Kooboo代码，可用于AI协同开发及Git管理。

## 功能
- 从Kooboo拉取代码
- 推送代码到Kooboo

## 安装
```bash
npm install kooboo_sync
```

## 环境变量配置
### 方式一：使用 `.env` 文件
在项目根目录下创建 `.env` 文件，内容如下：
```bash
API_BASE_URL=http://your_api_url
BASIC_AUTH_USER_NAME=your_username
BASIC_AUTH_PASSWORD=your_password
SITE_ID=your_site_id
FOLDER_NAME=your_folder_name
```

### 方式二：命令行直接传递
```bash
API_BASE_URL=http://your_api_url BASIC_AUTH_USER_NAME=your_username BASIC_AUTH_PASSWORD=your_password SITE_ID=your_site_id npx kooboo-push
```

## 使用
> 强烈建议配合git使用，在执行命令前`暂存所有更改`。这可以防止命令执行失败或误操作导致本地代码丢失，便于快速恢复。


### 初始化｜修复目录结构｜自动补全__metadata.json
```bash
npx kooboo-fix
```

### 拉取代码
```bash
npx kooboo-pull
```

强制拉取所有代码：
```bash
npx kooboo-pull -f
```

### 推送代码
```bash
npx kooboo-push
```

强制推送所有代码：
```bash
npx kooboo-push -f
```

## 项目结构
- **Api**: API相关代码
- **Code**: 后端相关代码
- **Page**: 页面相关代码
- **View**: 视图相关代码
- **Layout**: 布局相关代码
- **Style**: 样式文件
- **Script**: 脚本文件

## 元数据
每个目录下都有一个 `__metadata.json` 文件，包含该目录的元信息。

## 开发
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 本地测试
npm run fix
npm run pull
npm run push
```

## 许可证
MIT