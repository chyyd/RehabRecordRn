# 🏗️ RehabRecordRn 架构设计文档

**版本**: 1.0.0
**最后更新**: 2025-01-20
**维护者**: chyyd

---

## 📋 目录

- [架构概览](#架构概览)
- [技术选型](#技术选型)
- [项目结构](#项目结构)
- [状态管理](#状态管理)
- [导航架构](#导航架构)
- [数据流](#数据流)
- [离线同步机制](#离线同步机制)
- [API设计](#api设计)
- [安全机制](#安全机制)
- [性能优化](#性能优化)
- [测试策略](#测试策略)

---

## 架构概览

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                      Presentation Layer                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Screens   │  │ Components │  │   Hooks    │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      Business Logic Layer               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Stores   │  │  Services  │  │   Utils    │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                        Data Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  API Client│  │AsyncStorage│  │   Sync     │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### 设计原则

1. **单一职责**: 每个模块只负责一个功能领域
2. **依赖注入**: 使用Zustand的依赖注入机制
3. **类型安全**: 全面使用TypeScript确保类型安全
4. **可测试性**: 业务逻辑与UI分离，便于单元测试
5. **离线优先**: 支持离线操作，联网自动同步

---

## 技术选型

### 核心框架

| 技术 | 选择理由 |
|------|---------|
| **React Native 0.73.6** | 跨平台原生体验，性能优秀，社区活跃 |
| **TypeScript 5.0.4** | 类型安全，提升代码质量和开发效率 |
| **React 18.2.0** | 并发特性，性能优化，生态系统成熟 |

### 状态管理

| 方案 | 选择理由 | 未选择方案 |
|------|---------|-----------|
| **Zustand** | 轻量级（1KB）、简洁API、无Context、无Provider | Redux（过于复杂）、MobX（学习曲线）、Context API（性能问题） |

### UI框架

| 技术 | 选择理由 |
|------|---------|
| **react-native-paper** | Material Design设计规范、组件丰富、类型完善 |
| **react-native-vector-icons** | 图标丰富、易于使用、性能优秀 |

### 导航

| 技术 | 选择理由 |
|------|---------|
| **@react-navigation 7.x** | 官方推荐、类型安全、社区活跃 |

### 数据存储

| 技术 | 选择理由 |
|------|---------|
| **AsyncStorage** | 简单易用、持久化存储、React Native官方推荐 |

### 网络请求

| 技术 | 选择理由 |
|------|---------|
| **axios** | Promise API、拦截器、自动转换JSON、错误处理 |

---

## 项目结构

### 目录组织原则

```
src/
├── components/      # 可复用UI组件
├── hooks/          # 自定义React Hooks
├── navigation/     # 导航配置
├── screens/        # 页面组件（按功能模块划分）
├── services/       # 业务服务层
├── stores/         # 状态管理
└── utils/          # 工具函数
```

### 分层架构

#### 1. Presentation Layer（展示层）

**职责**: UI渲染、用户交互

- **Screens**: 页面级组件
- **Components**: 可复用UI组件
- **Hooks**: 自定义React Hooks

#### 2. Business Logic Layer（业务逻辑层）

**职责**: 状态管理、业务逻辑、数据处理

- **Stores**: Zustand状态管理
- **Services**: API调用、数据处理
- **Utils**: 工具函数、业务逻辑

#### 3. Data Layer（数据层）

**职责**: 数据持久化、网络通信

- **API Client**: HTTP请求封装
- **AsyncStorage**: 本地存储封装
- **Sync**: 数据同步管理

---

## 状态管理

### Zustand Store架构

```typescript
// Store基本结构
interface Store {
  // State
  data: any[]
  loading: boolean
  error: string | null

  // Actions
  fetchData: () => Promise<void>
  updateData: (id: string, data: any) => Promise<void>
  deleteData: (id: string) => Promise<void>

  // Selectors（可选）
  getDataById: (id: string) => any | undefined
}
```

### Store模块划分

#### authStore（认证状态）

**职责**:
- 用户登录/登出
- Token管理（存储、刷新、验证）
- 用户信息管理

**关键方法**:
```typescript
interface AuthStore {
  token: string | null
  userInfo: UserInfo | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateUser: (info: Partial<UserInfo>) => void
}
```

**持久化**: 使用`persist`中间件，存储Token和用户信息

#### patientStore（患者状态）

**职责**:
- 患者列表管理
- 患者CRUD操作
- 本地缓存策略

**关键方法**:
```typescript
interface PatientStore {
  patients: Patient[]
  selectedPatient: Patient | null
  loading: boolean
  error: string | null

  fetchPatients: (forceRefresh?: boolean) => Promise<void>
  getPatientById: (id: string) => Patient | undefined
  createPatient: (patient: NewPatient) => Promise<void>
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>
  deletePatient: (id: string) => Promise<void>
  setSelectedPatient: (patient: Patient | null) => void
}
```

**持久化**:
- 内存缓存患者列表
- AsyncStorage缓存最近访问记录

#### recordStore（记录状态）

**职责**:
- 康复记录管理
- 记录CRUD操作
- 患者历史记录查询

**关键方法**:
```typescript
interface RecordStore {
  records: Record[]
  selectedRecord: Record | null
  patientHistory: Record[]
  loading: boolean

  fetchRecords: (patientId: string) => Promise<void>
  createRecord: (record: NewRecord) => Promise<void>
  updateRecord: (id: string, record: Partial<Record>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
  fetchPatientHistory: (patientId: string) => Promise<void>
}
```

#### syncStore（同步状态）

**职责**:
- 离线队列管理
- 同步状态跟踪
- 网络状态监听

**关键方法**:
```typescript
interface SyncStore {
  isOnline: boolean
  syncQueue: SyncQueueItem[]
  isSyncing: boolean
  lastSyncTime: number | null

  addToSyncQueue: (item: SyncQueueItem) => Promise<SyncResult>
  processSyncQueue: () => Promise<void>
  clearSyncQueue: () => Promise<void>
  setOnlineStatus: (online: boolean) => void
}
```

### Store间通信

使用Zustand的依赖注入机制：

```typescript
// patientStore依赖syncStore
const usePatientStore = create((setState, getState) => ({
  // ...

  async createPatient(patient: NewPatient) {
    const syncStore = useSyncStore.getState()

    if (syncStore.isOnline) {
      // 在线直接调用API
      await patientApi.createPatient(patient)
    } else {
      // 离线添加到同步队列
      await syncStore.addToSyncQueue({
        collection: 'patients',
        type: 'create',
        data: patient
      })
    }
  }
}))
```

---

## 导航架构

### 三层导航结构

```
RootNavigator (根导航)
    ↓
    ├─ AuthNavigator (认证导航)
    │   ├─ LoginScreen
    │   └─ SplashScreen
    │
    └─ MainNavigator (主应用导航)
        ├─ HomeScreen (Tab 1)
        ├─ PatientListScreen (Tab 2)
        ├─ CreateRecordScreen (Tab 3)
        └─ ProfileScreen (Tab 4)
```

### 导航类型定义

```typescript
// 认证导航类型
export type AuthStackParamList = {
  Splash: undefined
  Login: undefined
}

// 主导航类型
export type MainStackParamList = {
  Home: undefined
  PatientList: undefined
  PatientDetail: { patientId: string }
  CreateRecord: { patientId?: string }
  RecordDetail: { recordId: string }
  RecordHistory: { patientId: string }
  Scan: undefined
}

// Root导航类型
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainStackParamList>
}
```

### 导航守卫

在RootNavigator中实现认证检查：

```typescript
export default function RootNavigator() {
  const token = useAuthStore(state => state.token)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

---

## 数据流

### 单向数据流

```
┌─────────────┐
│   User      │
│  Interaction│
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Screen    │
│  Component  │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ↓              ↓
┌─────────────┐  ┌─────────────┐
│    Hook     │  │    Store    │
│  (useStore) │  │  (setState) │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                ↓
         ┌─────────────┐
         │   Service   │
         │ (API Call)  │
         └──────┬──────┘
                │
                ↓
         ┌─────────────┐
         │   API       │
         │   Server    │
         └─────────────┘
                │
                ↓ (Response)
         ┌─────────────┐
         │   Store    │
         │ (update)   │
         └──────┬──────┘
                │
                ↓
         ┌─────────────┐
         │   Screen    │
         │ (re-render) │
         └─────────────┘
```

### 数据更新流程

#### 1. 用户操作触发数据更新

```typescript
// 1. 用户在PatientListScreen点击删除
const handleDelete = async (patientId: string) => {
  try {
    // 2. 调用store的deletePatient方法
    await usePatientStore.getState().deletePatient(patientId)

    // 3. Store内部调用API
    // 4. Store更新状态
    // 5. Screen自动重新渲染
  } catch (error) {
    // 6. 错误处理
  }
}
```

#### 2. 离线操作流程

```typescript
// 1. 用户离线创建患者
const handleCreate = async (patientData: NewPatient) => {
  const syncStore = useSyncStore.getState()

  if (!syncStore.isOnline) {
    // 2. 添加到同步队列
    await syncStore.addToSyncQueue({
      collection: 'patients',
      type: 'create',
      data: patientData
    })

    // 3. 更新本地状态（乐观更新）
    usePatientStore.getState().addPatientToLocal(patientData)
  }
}
```

#### 3. 在线自动同步

```typescript
// 1. 网络恢复
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      // 2. 处理同步队列
      syncStore.processSyncQueue()
    }
  })

  return () => unsubscribe()
}, [])
```

---

## 离线同步机制

### 同步策略

#### 1. 乐观更新（Optimistic Update）

```typescript
async createPatient(patient: NewPatient) {
  const tempId = `temp_${Date.now()}`

  // 1. 立即更新UI（乐观更新）
  setState(state => ({
    patients: [...state.patients, { ...patient, id: tempId }]
  }))

  try {
    // 2. 后台调用API
    const result = await patientApi.createPatient(patient)

    // 3. 替换临时ID为真实ID
    setState(state => ({
      patients: state.patients.map(p =>
        p.id === tempId ? result : p
      )
    }))
  } catch (error) {
    // 4. 失败回滚
    setState(state => ({
      patients: state.patients.filter(p => p.id !== tempId)
    }))

    // 5. 添加到同步队列
    await syncStore.addToSyncQueue({
      collection: 'patients',
      type: 'create',
      data: patient
    })
  }
}
```

#### 2. 同步队列设计

```typescript
interface SyncQueueItem {
  id: string          // 唯一标识
  collection: string  // 集合名称（patients/records）
  type: 'create' | 'update' | 'delete'
  data: any           // 操作数据
  timestamp: number   // 时间戳
  retryCount: number  // 重试次数
}
```

#### 3. 同步执行流程

```typescript
async processSyncQueue() {
  const queue = this.syncQueue

  for (const item of queue) {
    try {
      switch (item.type) {
        case 'create':
          await apiClient.post(`/${item.collection}`, item.data)
          break
        case 'update':
          await apiClient.put(`/${item.collection}/${item.data.id}`, item.data)
          break
        case 'delete':
          await apiClient.delete(`/${item.collection}/${item.data.id}`)
          break
      }

      // 成功：从队列移除
      await this.removeFromQueue(item.id)
    } catch (error) {
      // 失败：增加重试计数
      item.retryCount++

      // 超过最大重试次数，标记为失败
      if (item.retryCount >= MAX_RETRY) {
        await this.markAsFailed(item.id)
      }
    }
  }
}
```

#### 4. 冲突解决策略

基于时间戳的Last-Write-Wins策略：

```typescript
async resolveConflict(localData: any, serverData: any) {
  // 比较时间戳
  if (localData.updatedAt > serverData.updatedAt) {
    // 本地数据更新，使用本地数据
    return localData
  } else {
    // 服务器数据更新，使用服务器数据
    return serverData
  }
}
```

---

## API设计

### API客户端配置

```typescript
// src/services/api/client.ts
import axios, { AxiosInstance } from 'axios'
import { AsyncStorage } from '@react-native-async-storage/async-storage'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：注入Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Token过期处理
    if (error.response?.status === 401) {
      const authStore = useAuthStore.getState()
      await authStore.refreshToken()

      // 重试原请求
      const originalRequest = error.config
      return apiClient(originalRequest)
    }

    return Promise.reject(error)
  }
)
```

### API接口设计

#### RESTful API规范

| 方法 | 端点 | 描述 | 示例 |
|------|------|------|------|
| GET | `/patients` | 获取患者列表 | `GET /patients?page=1&limit=20` |
| GET | `/patients/:id` | 获取患者详情 | `GET /patients/123` |
| POST | `/patients` | 创建患者 | `POST /patients` + Body |
| PUT | `/patients/:id` | 更新患者 | `PUT /patients/123` + Body |
| DELETE | `/patients/:id` | 删除患者 | `DELETE /patients/123` |
| GET | `/patients/:id/records` | 获取患者记录 | `GET /patients/123/records` |
| POST | `/records` | 创建记录 | `POST /records` + Body |

#### 请求/响应格式

**请求格式**:
```typescript
// GET请求
interface GetPatientsParams {
  page?: number
  limit?: number
  search?: string
}

// POST/PUT请求
interface PatientRequestBody {
  name: string
  age: number
  gender: 'male' | 'female'
  phone: string
  diagnosis?: string
}
```

**响应格式**:
```typescript
interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
```

---

## 安全机制

### 认证流程

```typescript
// 1. 登录
async login(credentials: LoginCredentials) {
  const response = await authApi.login(credentials)

  // 2. 存储Token
  await AsyncStorage.setItem('token', response.token)

  // 3. 存储用户信息
  await AsyncStorage.setItem('userInfo', JSON.stringify(response.user))

  // 4. 更新状态
  setState({
    token: response.token,
    userInfo: response.user,
    isAuthenticated: true
  })
}

// 2. Token刷新
async refreshToken() {
  const refreshToken = await AsyncStorage.getItem('refreshToken')
  const response = await authApi.refreshToken({ refreshToken })

  await AsyncStorage.setItem('token', response.token)
  setState({ token: response.token })
}

// 3. 登出
async logout() {
  await AsyncStorage.multiRemove(['token', 'refreshToken', 'userInfo'])
  setState({
    token: null,
    userInfo: null,
    isAuthenticated: false
  })
}
```

### 数据加密

- **传输加密**: HTTPS/TLS
- **存储加密**: AsyncStorage敏感数据加密存储（TODO）
- **密码加密**: bcrypt哈希（服务器端）

### 权限控制

```typescript
// 角色权限映射
const ROLE_PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage'],
  doctor: ['read', 'write', 'delete'],
  therapist: ['read', 'write'],
  nurse: ['read'],
}

function hasPermission(role: string, action: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false
}
```

---

## 性能优化

### 1. 列表优化

```typescript
// 使用FlatList的优化配置
<FlatList
  data={patients}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}

  // 性能优化
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={10}

  // 防止不必要的重新渲染
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 2. 图片优化

```typescript
// 使用react-native-fast-image（TODO）
import FastImage from 'react-native-fast-image'

<FastImage
  source={{ uri: patient.avatar }}
  resizeMode={FastImage.resizeMode.cover}
  style={styles.avatar}
/>
```

### 3. 状态优化

```typescript
// 使用Selector避免不必要的重渲染
// ❌ 不好的做法
const patients = usePatientStore()

// ✅ 好的做法
const patients = usePatientStore(state => state.patients)
const loading = usePatientStore(state => state.loading)
```

### 4. 请求优化

```typescript
// 防抖搜索
const debouncedSearch = useDebounce(
  (keyword: string) => {
    patientStore.fetchPatients({ search: keyword })
  },
  500
)

// 请求取消
const cancelTokenSource = axios.CancelToken.source()

apiClient.get('/patients', {
  cancelToken: cancelTokenSource.token
})

// 组件卸载时取消请求
useEffect(() => {
  return () => {
    cancelTokenSource.cancel('Component unmounted')
  }
}, [])
```

---

## 测试策略

### 测试金字塔

```
        /\
       /E2E\        5% (端到端测试)
      /------\
     /  集成  \      15% (集成测试)
    /----------\
   /   单元测试  \    80% (单元测试)
  /--------------\
```

### 测试覆盖率目标

| 模块 | 目标覆盖率 | 当前覆盖率 |
|------|-----------|-----------|
| Store | 95%+ | 93.12% ✅ |
| API | 85%+ | 83.96% ✅ |
| Utils | 85%+ | 84.76% ✅ |
| Components | 70%+ | 55.55% ⚠️ |
| Hooks | 70%+ | 55.1% ⚠️ |

### 测试组织结构

```
__tests__/
├── unit/              # 单元测试
│   ├── stores/        # Store测试
│   ├── services/      # Service测试
│   ├── utils/         # Utils测试
│   ├── hooks/         # Hook测试
│   └── components/    # Component测试
├── integration/       # 集成测试（TODO）
└── e2e/              # 端到端测试（TODO）
```

---

## 参考资源

- [React Native官方文档](https://reactnative.dev/)
- [Zustand文档](https://github.com/pmndrs/zustand)
- [React Navigation文档](https://reactnavigation.org/)
- [Jest文档](https://jestjs.io/)
- [Testing Library文档](https://testing-library.com/)

---

**文档维护**: 本文档应随项目演进持续更新

**最后更新**: 2025-01-20
