# 康复科治疗记录系统 - 开发文档

## 开发规范

### TypeScript 类型定义

所有函数参数和返回值都应该有明确的类型定义：

```typescript
// ✅ 好的做法
const fetchPatients = async (params?: PatientSearchParams): Promise<Patient[]> => {
  // ...
}

// ❌ 不好的做法
const fetchPatients = async (params?: any) => {
  // ...
}
```

### 组件开发

- 使用函数组件 + Hooks
- Props 必须定义接口
- 导出前添加注释说明功能

```typescript
/**
 * 患者列表卡片组件
 * @param patient - 患者信息对象
 * @param onPress - 点击回调函数
 */
const PatientCard = ({ patient, onPress }: PatientCardProps) => {
  // ...
}
```

### 状态管理

- 使用 Zustand 进行全局状态管理
- 避免在组件中过度使用 useState
- 复杂逻辑抽取到自定义 Hooks

## API 调用规范

### 错误处理

所有 API 调用都应该包含错误处理：

```typescript
try {
  const response = await apiClient.post('/api/endpoint', data)
  // 处理成功响应
} catch (error) {
  // 错误已经在 API 客户端中统一处理
  // 这里只需要处理业务逻辑
}
```

### Token 管理

Token 自动注入，无需手动添加：

```typescript
// ✅ 正确做法
const response = await patientApi.getPatients()

// ❌ 错误做法
const response = await axios.get('/patients', {
  headers: { Authorization: `Bearer ${token}` }
})
```

## 导航规范

### 页面跳转

```typescript
// 使用导航对象
navigation.navigate('PatientDetail', { patientId: 123 })

// 带类型断言
navigation.navigate('PatientDetail' as never, { patientId: 123 } as never)
```

### 参数传递

```typescript
// 发送参数
navigation.navigate('RecordDetail', { recordId: 456 })

// 接收参数
const { recordId } = route.params as { recordId: number }
```

## 样式规范

### StyleSheet

使用 StyleSheet.create 定义样式：

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
})
```

### 主题颜色

使用主题中定义的颜色，避免硬编码：

```typescript
const theme = useTheme()
<View style={{ backgroundColor: theme.colors.primary }} />
```

## 离线功能开发

### 数据保存

```typescript
const { saveOffline } = useOfflineData()

// 离线保存
await saveOffline('records', 'CREATE', recordData)
```

### 同步检查

```typescript
const { needsSync } = useOfflineData()

const needsSyncing = await needsSync('records', recordId)
```

## 调试技巧

### 日志输出

```typescript
// 开发环境日志
if (__DEV__) {
  console.log('[Component] 数据加载', data)
}

// 调试特定问题
console.table(arrayData)
console.group('相关日志')
console.log('详细数据', data)
console.groupEnd()
```

### 性能监控

```typescript
import { Performance } from 'react-native'

const startTime = Performance.now()
// 执行操作
const endTime = Performance.now()
console.log(`操作耗时: ${endTime - startTime}ms`)
```

## 常见问题解决

### 导航错误

确保页面已在导航器中注册：

```typescript
// MainNavigator.tsx
<Stack.Screen name="PageName" component={PageComponent} />
```

### 类型错误

运行 TypeScript 检查：

```bash
npx tsc --noEmit
```

### Metro 缓存问题

```bash
npx react-native start --reset-cache
```

## 发布检查清单

- [ ] 修改 API 地址为生产环境
- [ ] 生成签名密钥
- [ ] 配置混淆规则
- [ ] 测试所有核心功能
- [ ] 检查内存泄漏
- [ ] 验证离线同步
- [ ] 更新版本号
- [ ] 生成 Release APK

## 持续改进

### 代码审查要点

1. TypeScript 类型安全
2. 错误处理完整性
3. 性能优化（避免不必要的渲染）
4. 代码可读性和维护性
5. 测试覆盖率

### 重构建议

- 定期重构重复代码
- 提取通用组件
- 优化大型函数
- 改进类型定义
