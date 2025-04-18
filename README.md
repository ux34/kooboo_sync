# Kooboo 项目同步工具
> 本地化Kooboo开发，可用于AI协同开发及Git管理。

## 功能
### 开发模式同步
- [x] 同步 Page
- [x] 同步 View
- [x] 同步 Layout
- [x] 同步 Api
- [x] 同步 Code
- [x] 同步 Style
- [x] 同步 Script
- [ ] 同步 Menu
- [ ] 同步 Form

### 站点数据同步
- [x] 同步 Settings
- [ ] 同步 Config
- [ ] 同步 Media
- [ ] 同步 File
- [ ] 同步 Module

## 安装
```bash
npm install kooboo_sync
```

## 使用
> 强烈建议配合git使用，在执行命令前`暂存所有更改`。
> 这可以防止命令执行失败或误操作导致本地代码丢失。

### 初始化项目
> 初始化环境变量文件
> 初始化.gitignore
> 添加script命令到package.json

使用URL自动初始化项目配置：
> 会自动拉取项目配置信息并生成.env文件
```bash
npx kooboo-init https://username:password@sitename.domain.com
```

或者手动初始化：
> 需要到.env文件中手动配置环境变量
> 格式请参考 [环境变量配置](#环境变量配置)
```bash
npx kooboo-init
```


### 修复目录结构｜自动补全__metadata.json
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

### 拉取站点数据
```bash
npx kooboo-pull-site
```

指定模块拉取：
```bash
npx kooboo-pull-site Settings,moduleName...
```

### 推送站点数据
```bash
npx kooboo-push-site
```

指定模块推送：
```bash
npx kooboo-push-site Settings,moduleName...
```

## 环境变量配置
在项目根目录下创建 `.env` 文件，内容如下：
```bash
# =========================================================
# kooboo-sync config
# =========================================================
# Kooboo Account
BASIC_AUTH_USER_NAME=your_username
BASIC_AUTH_PASSWORD=your_password
# Kooboo Site 
API_BASE_URL=your_api_url
SITE_ID=your_site_id
# Sync Module
SYNC_MODULES=Page,View,Layout,Api,Code,Style,Script
# Customize the folder name(Set to ./ to sync to project root.)
FOLDER_NAME=Kooboo
```

## 项目结构
- **Api**: API相关代码
- **Code**: 后端相关代码
- **Page**: 页面相关代码
- **View**: 视图相关代码
- **Layout**: 布局相关代码
- **Style**: 样式文件
- **Script**: 脚本文件
- **Data**: 其他文件

## 元数据
每个目录下都有一个 `__metadata.json` 文件，包含该模块代码的元信息(例如名称，路由，版本)，Data下对应的是站点设置。

## 开发
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 本地测试
npm run init [url]
npm run fix
npm run pull [-f]
npm run push [-f]
npm run site-pull [moduleName...]
npm run site-push [moduleName...]
```

## 许可证
MIT