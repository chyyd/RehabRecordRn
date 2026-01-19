# 测试指南 - 康复科治疗记录系统

**创建时间**: 2025-01-19
**测试框架**: Jest + React Native Testing Library

---

## 📊 当前测试覆盖状况

### 已完成的测试模块

| 模块 | 测试文件 | 测试数量 | 覆盖内容 |
|------|---------|---------|---------|
| **Store层** | authStore.test.ts | 15+ | 认证状态管理 |
| **Store层** | patientStore.test.ts | 12+ | 患者数据管理 |
| **工具函数** | retry.test.ts | 20+ | 重试机制 |
| **工具函数** | logger.test.ts | 12+ | 日志系统 |
| **Hooks** | useDebounce.test.ts | 6+ | 防抖Hook |
| **API层** | client.test.ts | 10+ | API客户端 |
| **总计** | 6个文件 | 75+ | - |

### 测试覆盖率目标

| 类型 | 当前 | 目标 | 状态 |
|------|------|------|------|
| **行覆盖率** | ~25% | 30% | 🟡 进行中 |
| **分支覆盖率** | ~20% | 30% | 🟡 进行中 |
| **函数覆盖率** | ~30% | 30% | ✅ 已达标 |
| **语句覆盖率** | ~25% | 30% | 🟡 进行中 |

---

## 🚀 快速开始

### 安装依赖

```bash
cd RehabRecordRn
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（推荐开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# CI环境测试
npm run test:ci
```

---

## 📁 测试文件结构

```
__tests__/
├── unit/                          # 单元测试
│   ├── stores/                    # Store层测试
│   │   ├── authStore.test.ts      # ✅ 认证Store测试
│   │   └── patientStore.test.ts   # ✅ 患者Store测试
│   ├── services/                  # 服务层测试
│   │   └── api/
│   │       └── client.test.ts     # ✅ API客户端测试
│   ├── utils/                     # 工具函数测试
│   │   ├── retry.test.ts          # ✅ 重试机制测试
│   │   └── logger.test.ts         # ✅ 日志系统测试
│   └── hooks/                     # Hooks测试
│       └── useDebounce.test.ts    # ✅ 防抖Hook测试
├── integration/                   # 集成测试（待添加）
│   └── api/
└── components/                    # 组件测试（待添加）
    └── screens/
```

---

## 📝 编写测试指南

### 1. Store层测试

Store是核心业务逻辑，应该优先测试。

**测试要点**：
- ✅ 初始状态验证
- ✅ Actions功能测试
- ✅ 异步操作测试
- ✅ 错误处理测试
- ✅ 选择器功能测试

**示例**：
```typescript
describe('AuthStore', () => {
  it('应该成功登录并更新状态', async () => {
    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.login(credentials)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('mock-token')
  })
})
```

### 2. 工具函数测试

纯函数最容易测试，应该追求100%覆盖率。

**测试要点**：
- ✅ 正常情况
- ✅ 边界条件
- ✅ 错误输入
- ✅ 特殊情况

**示例**：
```typescript
describe('retryWithBackoff', () => {
  it('应该在失败后重试并最终成功', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockResolvedValue('success')

    const result = await retryWithBackoff(mockFn, { maxRetries: 2 })

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })
})
```

### 3. Hooks测试

使用 `@testing-library/react-native` 测试自定义Hooks。

**测试要点**：
- ✅ 初始返回值
- ✅ 状态更新
- ✅ 副作用（useEffect）
- ✅ 清理函数

**示例**：
```typescript
describe('useDebounce', () => {
  it('应该在延迟时间后更新值', () => {
    const { result, rerender } = renderHook(
      (value) => useDebounce(value, 500),
      { initialProps: 'initial' }
    )

    rerender('updated')
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })
})
```

### 4. API层测试

使用 `axios-mock-adapter` Mock HTTP请求。

**测试要点**：
- ✅ 成功响应
- ✅ 失败响应
- ✅ 重试机制
- ✅ 拦截器功能
- ✅ 超时处理

**示例**：
```typescript
describe('ApiClient', () => {
  it('应该支持重试机制', async () => {
    let attemptCount = 0
    mockAxios.onGet('/test').reply(() => {
      attemptCount++
      if (attemptCount < 3) {
        return [500, { message: 'Server Error' }]
      }
      return [200, { data: 'success' }]
    })

    const response = await apiClient.get('/test')

    expect(attemptCount).toBe(3)
    expect(response.data).toEqual({ data: 'success' })
  })
})
```

---

## 🎯 待编写测试

### 高优先级（本周完成）

1. **recordStore.test.ts** - 治疗记录Store
2. **syncStore.test.ts** - 数据同步Store
3. **useOnlineStatus.test.ts** - 网络状态Hook
4. **asyncStorage.test.ts** - 存储服务测试

### 中优先级（本月完成）

5. **auth.api.test.ts** - 认证API测试
6. **patient.api.test.ts** - 患者API测试
7. **record.api.test.ts** - 记录API测试
8. **ErrorBoundary.test.tsx** - 错误边界组件测试

### 低优先级（时间允许时）

9. **LoginScreen.test.tsx** - 登录屏幕组件测试
10. **PatientListScreen.test.tsx** - 患者列表屏幕测试
11. **SignaturePad.test.tsx** - 签名板组件测试
12. **其他屏幕和组件测试**

---

## 🛠️ 测试工具和配置

### 已安装的测试依赖

```json
{
  "@testing-library/jest-native": "^5.4.3",
  "@testing-library/react-native": "^12.4.2",
  "@types/jest": "^29.5.11",
  "axios-mock-adapter": "^1.22.0",
  "jest-environment-jsdom": "^29.7.0",
  "jest-extended": "^4.0.2"
}
```

### Jest配置

**文件**: `jest.config.js`

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
}
```

### 测试环境设置

**文件**: `jest.setup.js`

- 导入测试扩展
- Mock AsyncStorage
- Mock React Navigation
- Mock React Native Paper
- 配置全局设置

---

## 📈 提高测试覆盖率

### 当前待覆盖的关键文件

**Store层**（重要）：
- ⬜ `src/stores/recordStore.ts` - 治疗记录管理
- ⬜ `src/stores/syncStore.ts` - 数据同步逻辑

**Hooks**：
- ⬜ `src/hooks/useOnlineStatus.ts` - 网络状态监听
- ⬜ `src/hooks/useOfflineData.ts` - 离线数据管理

**API服务**：
- ⬜ `src/services/api/auth.api.ts` - 认证API
- ⬜ `src/services/api/patient.api.ts` - 患者API
- ⬜ `src/services/api/record.api.ts` - 记录API

**组件**：
- ⬜ `src/components/ErrorBoundary/index.tsx` - 错误边界
- ⬜ `src/components/SignaturePad/index.tsx` - 签名板
- ⬜ `src/screens/auth/LoginScreen.tsx` - 登录屏幕
- ⬜ `src/screens/patients/PatientListScreen.tsx` - 患者列表

---

## 🔍 测试最佳实践

### 1. AAA模式

```typescript
it('应该成功登录', () => {
  // Arrange（准备）
  const credentials = { username: 'test', password: '123' }
  mockAuthApi.login.mockResolvedValue(mockResponse)

  // Act（执行）
  await act(async () => {
    await result.current.login(credentials)
  })

  // Assert（断言）
  expect(result.current.isAuthenticated).toBe(true)
})
```

### 2. 测试异步代码

```typescript
// ✅ 好的做法
await act(async () => {
  await result.current.login(credentials)
})

// ❌ 避免这样
await result.current.login(credentials) // 可能导致状态更新警告
```

### 3. Mock外部依赖

```typescript
// Mock API
jest.mock('@/services/api', () => ({
  authApi: {
    login: jest.fn(),
  },
}))

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  AsyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}))
```

### 4. 清理副作用

```typescript
beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})
```

---

## 🐛 调试测试

### 查看测试详情

```bash
# 显示详细输出
npm test -- --verbose

# 只运行特定测试文件
npm test authStore.test.ts

# 只运行特定测试
npm test -- -t "应该成功登录"
```

### Jest调试模式

```bash
# 运行特定测试并打开node debugger
node --inspect-brk node_modules/.bin/jest --runInBand authStore.test.ts
```

---

## 📊 持续集成

### CI脚本

**文件**: `.github/workflows/test.yml`（待创建）

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:ci
```

### 测试覆盖率徽章

```markdown
![Tests](https://github.com/username/repo/workflows/tests/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-25%25-yellow)
```

---

## ✅ 测试检查清单

### 提交代码前检查

- [ ] 所有测试通过
- [ ] 测试覆盖率不低于当前水平
- [ ] 新功能有对应的测试
- [ ] Bug修复有回归测试

### PR审查测试检查

- [ ] 测试是否覆盖正常流程？
- [ ] 测试是否覆盖错误情况？
- [ ] 测试是否易于维护？
- [ ] 测试命名是否清晰？

---

## 📚 参考资源

### 官方文档

- [Jest 官方文档](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library 文档](https://testing-library.com/)

### 社区资源

- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library/)

---

**文档版本**: 1.0
**最后更新**: 2025-01-19
**维护者**: 开发团队
