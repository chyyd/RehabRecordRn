# 环境变量配置指南

## 概述

本项目使用 `react-native-dotenv` 管理不同环境的配置，支持开发、测试和生产环境的快速切换。

## 环境文件

- `.env` - 开发环境配置（默认）
- `.env.staging` - 预发布环境配置
- `.env.production` - 生产环境配置
- `.env.example` - 环境变量示例文件

## 安装依赖

首次运行前需要安装依赖：

```bash
npm install
# 或
yarn install
```

## 环境变量说明

### API 配置

```bash
# API 基础 URL
API_BASE_URL=http://10.0.2.2:3000

# API 超时时间（毫秒）
API_TIMEOUT=10000
```

### 应用配置

```bash
# 应用环境 (development | staging | production)
APP_ENV=development

# 应用名称
APP_NAME=康复科治疗记录系统

# 应用版本
APP_VERSION=1.0.0
```

### 功能开关

```bash
# 是否启用调试模式
ENABLE_DEBUG=true

# 是否启用离线同步
ENABLE_OFFLINE_SYNC=true
```

## 切换环境

### 方法1：替换 .env 文件（推荐）

```bash
# 切换到生产环境
cp .env.production .env

# 切换到测试环境
cp .env.staging .env

# 切换到开发环境
cp .env.example .env
```

### 方法2：使用 npm scripts（需要配置）

在 `package.json` 中添加：

```json
{
  "scripts": {
    "android:dev": "cp .env .env.local && react-native run-android",
    "android:staging": "cp .env.staging .env.local && react-native run-android",
    "android:prod": "cp .env.production .env.local && react-native run-android"
  }
}
```

## 使用环境变量

在代码中导入并使用：

```typescript
import { API_BASE_URL, APP_ENV } from '@env'

// 使用环境变量
console.log(API_BASE_URL)
console.log(APP_ENV)
```

或者在 `constants.ts` 中统一管理：

```typescript
import { API_BASE_URL, API_TIMEOUT } from '@env'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: parseInt(API_TIMEOUT, 10),
}
```

## Android 模拟器访问本机

开发环境中，如果API服务器运行在本机：

- **Android 模拟器**: 使用 `http://10.0.2.2:3000`
- **Genymotion**: 使用 `http://10.0.3.2:3000`
- **真机**: 使用本机的局域网IP，如 `http://192.168.1.100:3000`

## 生产环境部署

生产环境构建前，确保：

1. 更新 `.env.production` 中的配置
2. 复制生产环境配置：`cp .env.production .env`
3. 运行构建命令：`cd android && ./gradlew assembleRelease`

## 安全注意事项

⚠️ **重要**：

- **永远不要**将包含敏感信息的 `.env` 文件提交到Git
- `.env.example` 文件应该只包含示例值，不包含真实密钥
- 生产环境的密钥应该使用安全的密钥管理服务
- API密钥、Token等敏感信息应该使用环境变量管理

## .gitignore 配置

确保 `.gitignore` 包含：

```
# 环境变量文件
.env
.env.local
.env.*.local
```

## 故障排除

### 环境变量未生效

1. 清理缓存并重启：
```bash
npm start -- --reset-cache
# 或
yarn start --reset-cache
```

2. 重新构建：
```bash
cd android && ./gradlew clean
cd .. && react-native run-android
```

### TypeScript 报错

如果提示找不到 `@env` 模块，确保：

1. `src/types/env.d.ts` 文件存在
2. `tsconfig.json` 包含类型声明
3. 重启 TypeScript服务器

## 参考资源

- [react-native-dotenv 文档](https://github.com/goatandsheep/react-native-dotenv)
- [React Native 环境配置最佳实践](https://reactnative.dev/docs/environment-setup)
