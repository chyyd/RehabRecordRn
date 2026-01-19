# 康复科治疗记录系统 - React Native 原生应用

虎林市中医医院康复科治疗记录系统 Android 原生应用

## 项目简介

本应用是基于 React Native 开发的 Android 原生应用，为虎林市中医医院康复科提供治疗记录电子化管理服务。应用支持离线工作，提供流畅的原生体验。

## 核心功能

- ✅ **用户认证**：安全的登录认证系统，支持多种角色
- ✅ **患者管理**：患者列表、搜索、详情查看
- ✅ **治疗记录**：创建记录、计时、签名确认
- ✅ **离线支持**：离线创建记录，联网自动同步
- ✅ **历史查询**：按患者查看历史治疗记录
- ✅ **扫码功能**：快速定位患者（计划中）

## 技术栈

- **框架**：React Native 0.73.6
- **语言**：TypeScript 5.4.5
- **导航**：@react-navigation 6.x
- **UI 组件**：React Native Paper 5.x
- **状态管理**：Zustand 4.x
- **本地存储**：AsyncStorage
- **网络请求**：Axios
- **签名组件**：react-native-signature-canvas

## 项目结构

```
RehabRecordRn/
├── android/                 # Android 原生代码
├── ios/                     # iOS 代码（可选）
├── src/
│   ├── components/          # 可复用组件
│   │   ├── SignaturePad/    # 电子签名
│   │   └── SyncStatusBar/   # 同步状态栏
│   ├── screens/             # 页面组件
│   │   ├── auth/            # 认证流程
│   │   ├── patients/        # 患者管理
│   │   ├── records/         # 治疗记录
│   │   ├── scanner/         # 扫码
│   │   └── home/            # 工作台
│   ├── navigation/          # 导航配置
│   ├── stores/              # 状态管理
│   ├── services/            # 业务服务
│   │   ├── api/             # API 接口
│   │   ├── storage/         # 本地存储
│   │   └── sync/            # 数据同步
│   ├── hooks/               # 自定义 Hooks
│   ├── utils/               # 工具函数
│   ├── types/               # 类型定义
│   └── assets/              # 静态资源
├── App.tsx                  # 应用入口
├── package.json             # 依赖配置
└── tsconfig.json            # TypeScript 配置
```

## 快速开始

### 环境要求

- Node.js >= 18.x
- npm 或 yarn
- JDK 11+
- Android Studio
- Android SDK (API Level 24+)

### 安装依赖

```bash
npm install
```

### 运行开发环境

1. **启动 Android 模拟器或连接真机**

2. **启动 Metro 服务**
```bash
npm start
```

3. **运行 Android 应用**
```bash
npm run android
```

### 调试

- **Chrome DevTools**: 在应用中按 `Ctrl + M` (模拟器) 或摇动设备，选择 "Debug"
- **React Native Debugger**: 推荐使用 React Native Debugger 进行调试
- **日志查看**: `adb logcat *:S ReactNative:V ReactNativeJS:V`

## 构建 Release 版本

### 生成签名密钥

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore rehab-release-key.keystore -alias rehab-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 配置签名

将密钥文件放置在 `android/app/` 目录下，并更新 `android/gradle.properties`：

```properties
MYAPP_RELEASE_STORE_FILE=rehab-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=rehab-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

### 构建 APK

```bash
cd android
./gradlew assembleRelease
```

生成的 APK 位于：`android/app/build/outputs/apk/release/app-release.apk`

## 开发指南

### 代码规范

- 使用 TypeScript 编写类型安全的代码
- 遵循 ESLint 配置的代码风格
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase（组件）或 camelCase（工具）

### 状态管理

使用 Zustand 进行状态管理，主要的 Store：
- `authStore`: 认证状态
- `patientStore`: 患者数据
- `recordStore`: 治疗记录
- `syncStore`: 数据同步

### API 调用

所有 API 调用通过 `services/api/` 中的接口进行，自动处理 Token 注入和错误处理。

### 离线同步

- 应用支持离线创建治疗记录
- 联网后自动同步到服务器
- 同步状态在顶部状态栏显示

## 默认配置

### API 地址

- **开发环境**: `http://10.0.2.2:3000` (Android 模拟器)
- **生产环境**: 需在 `src/utils/constants.ts` 中配置

### 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 治疗师 | therapist | therapist123 |
| 医师 | doctor | doctor123 |
| 护士 | nurse | nurse123 |

## 常见问题

### Q: 如何修改 API 地址？

A: 编辑 `src/utils/constants.ts` 中的 `API_CONFIG.BASE_URL`

### Q: 如何清除应用数据？

A: 在应用设置中清除数据，或重新安装应用

### Q: 如何查看离线同步状态？

A: 顶部状态栏显示当前在线状态和同步进度

## 技术支持

- 项目仓库: [GitHub](https://github.com/chyyd/rehab-record-system)
- 问题反馈: [Issues](https://github.com/chyyd/rehab-record-system/issues)

## 版权信息

© 2025 虎林市中医医院康复科
