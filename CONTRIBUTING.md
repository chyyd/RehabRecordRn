# 🤝 贡献指南

感谢您对 RehabRecordRn 项目的关注！我们欢迎所有形式的贡献。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request指南](#pull-request指南)
- [问题反馈](#问题反馈)
- [获得帮助](#获得帮助)

---

## 行为准则

### 我们的承诺

为了营造开放和友好的环境，我们承诺让每个人参与项目都能获得愉快的体验。

### 我们的标准

积极行为包括：
- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

不可接受的行为包括：
- 使用性别化语言或图像
- 人身攻击或政治攻击
- 公开或私下的骚扰
- 未经许可发布他人私人信息
- 其他不专业或不适当的行为

---

## 如何贡献

### 贡献类型

我们欢迎以下类型的贡献：

1. 🐛 **修复Bug**
2. ✨ **新功能开发**
3. 📝 **文档改进**
4. 🎨 **UI/UX优化**
5. ⚡ **性能优化**
6. 🧪 **测试补充**
7. 🔧 **代码重构**
8. 🌍 **国际化支持**

### 报告Bug

在创建Bug报告前，请先搜索Issues确认是否已存在。

**Bug报告应包含**:
- 清晰的标题
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（OS、React Native版本等）
- 截图或错误日志

**Bug报告模板**:
```markdown
### 问题描述
简要描述遇到的问题

### 复现步骤
1. 进入页面 '...'
2. 点击按钮 '....'
3. 滚动到 '....'
4. 看到错误

### 预期行为
应该发生什么

### 实际行为
实际发生了什么

### 环境信息
- OS: [e.g. Android 13]
- React Native版本: [e.g. 0.73.6]
- 设备: [e.g. Pixel 5]

### 截图
如果适用，添加截图说明问题

### 额外信息
其他相关信息
```

### 提出新功能

在提出新功能前，请先讨论：

1. 在Issues中描述您的想法
2. 说明用例和预期收益
3. 讨论可能的实现方案
4. 等待维护者反馈

**功能请求模板**:
```markdown
### 功能描述
简要描述新功能

### 问题或用例
这个功能解决什么问题？为谁带来价值？

### 建议的解决方案
您认为应该如何实现？

### 备选方案
是否考虑过其他实现方式？

### 额外信息
其他相关信息、示例等
```

---

## 开发流程

### 1. 环境设置

```bash
# Fork仓库到您的GitHub账号
# 然后克隆您的Fork
git clone https://github.com/YOUR_USERNAME/RehabRecordRn.git
cd RehabRecordRn

# 添加上游仓库
git remote add upstream https://github.com/chyyd/RehabRecordRn.git

# 安装依赖
npm install

# 创建功能分支
git checkout -b feature/your-feature-name
```

### 2. 代码开发

```bash
# 查看现有代码
npm start

# 在另一个终端运行Android
npm run android

# 运行测试
npm test

# 监听模式运行测试
npm run test:watch
```

### 3. 代码规范检查

```bash
# 运行ESLint检查
npm run lint

# 自动修复可修复的问题
npm run lint -- --fix

# 运行Prettier格式化
npm run format
```

### 4. 提交代码

```bash
# 添加更改
git add .

# 提交（遵循提交规范）
git commit -m "feat(patient): add search functionality"

# 推送到您的Fork
git push origin feature/your-feature-name
```

### 5. 创建Pull Request

在GitHub上创建Pull Request，等待审查和合并。

---

## 代码规范

### TypeScript规范

#### 类型定义

```typescript
// ✅ 好的做法 - 明确类型定义
interface Patient {
  id: string
  name: string
  age: number
  gender: 'male' | 'female'
  createdAt: Date
}

function createPatient(patient: NewPatient): Promise<Patient> {
  // ...
}

// ❌ 不好的做法 - 使用any
function createPatient(patient: any): Promise<any> {
  // ...
}
```

#### 组件定义

```typescript
// ✅ 好的做法 - 明确Props类型
interface PatientListProps {
  patients: Patient[]
  loading: boolean
  onPatientPress: (patient: Patient) => void
}

export function PatientList({
  patients,
  loading,
  onPatientPress
}: PatientListProps) {
  // ...
}

// ❌ 不好的做法 - 缺少Props类型
export function PatientList({ patients, loading, onPatientPress }: any) {
  // ...
}
```

### React规范

#### 组件命名

```typescript
// ✅ 好的做法 - PascalCase
export function PatientListScreen() {}
export const UserProfile = () => {}

// ❌ 不好的做法
export function patientListScreen() {}
export const userProfile = () => {}
```

#### Hook使用

```typescript
// ✅ 好的做法 - 遵循Hook规则
export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  return { patients, loading }
}

// ❌ 不好的做法 - 条件Hook
export function usePatients() {
  if (someCondition) {
    useEffect(() => { // ❌ 不要在条件中使用Hook
      // ...
    })
  }
}
```

### 样式规范

#### StyleSheet使用

```typescript
// ✅ 好的做法 - 使用StyleSheet.create
import { StyleSheet } from 'react-native'

function PatientCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>患者姓名</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})

// ❌ 不好的做法 - 内联样式
function PatientCard() {
  return (
    <View style={{ padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>患者姓名</Text>
    </View>
  )
}
```

### Store规范

#### Zustand Store结构

```typescript
// ✅ 好的做法 - 清晰的Store结构
interface PatientStore {
  // State
  patients: Patient[]
  loading: boolean
  error: string | null

  // Actions
  fetchPatients: () => Promise<void>
  createPatient: (patient: NewPatient) => Promise<void>
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>
  deletePatient: (id: string) => Promise<void>

  // Selectors
  getPatientById: (id: string) => Patient | undefined
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  // State
  patients: [],
  loading: false,
  error: null,

  // Actions
  fetchPatients: async () => {
    set({ loading: true, error: null })
    try {
      const patients = await patientApi.getPatients()
      set({ patients, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // ...
}))
```

---

## 提交规范

### Commit Message格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型

| Type | 描述 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): add remember me functionality` |
| `fix` | Bug修复 | `fix(api): handle network timeout correctly` |
| `docs` | 文档更新 | `docs(readme): update installation instructions` |
| `style` | 代码格式 | `style(components): fix indentation` |
| `refactor` | 重构 | `refactor(stores): simplify patient store logic` |
| `perf` | 性能优化 | `perf(list): virtualize long lists` |
| `test` | 测试相关 | `test(api): add unit tests for auth service` |
| `chore` | 构建/工具 | `chore(deps): upgrade react-native to 0.73.6` |

### Subject格式

- 使用祈使句："add" 而不是 "added" 或 "adds"
- 首字母小写
- 结尾不要加句号

**示例**:
```bash
✅ feat(patient): add search functionality
✅ fix(api): handle 401 token expiration
✅ docs(readme): update contributing guide

❌ Feat(Patient): Add Search Functionality.
❌ fix(api): Fixed the bug
❌ added search feature
```

### Body格式

- 解释"what"和"why"，而不是"how"
- 每行控制在72字符内

**示例**:
```bash
feat(patient): add advanced search filters

Add support for filtering patients by:
- Age range
- Gender
- Diagnosis
- Treatment status

This allows therapists to quickly find specific patient
groups for reporting and analysis.

Closes #123
```

### Commit示例

```bash
# 新功能
git commit -m "feat(patient): add bulk export functionality

Implement CSV export for patient data with customizable
field selection. Users can now export patient lists
for reporting purposes."

# Bug修复
git commit -m "fix(sync): resolve race condition in queue processing

The sync queue could process items in wrong order when
multiple network requests completed simultaneously.
Added mutex lock to ensure sequential processing."

# 文档更新
git commit -m "docs(api): update authentication flow diagram

Clarified the token refresh process and added error
handling examples for common scenarios."

# 重构
git commit -m "refactor(stores): extract common logic to base store

Reduced code duplication across auth, patient, and
record stores by creating a reusable base store with
shared error handling and loading state management."
```

---

## Pull Request指南

### PR标题格式

与Commit Message相同格式：

```bash
feat(patient): add search functionality
fix(api): handle network timeout
docs(readme): update installation guide
```

### PR描述模板

```markdown
## 变更类型
- [ ] Bug修复 (修复现有问题)
- [ ] 新功能 (添加新功能)
- [ ] 破坏性变更 (会导致现有功能无法正常工作的变更)
- [ ] 文档更新 (文档改进或添加)

## 变更内容
简要描述您的更改

## 相关Issue
Closes #(issue number)

## 测试
描述您如何测试这些更改：
- [ ] 单元测试通过
- [ ] 手动测试完成
- [ ] 添加了新的测试用例

## 截图
如果适用，添加截图展示变更

## 检查清单
- [ ] 代码遵循项目的代码规范
- [ ] 添加了必要的文档
- [ ] 已自我审查代码
- [ ] 已添加注释说明复杂逻辑
- [ ] 已更新相关文档
- [ ] 所有测试通过
- [ ] 没有引入新的警告

## 额外信息
其他审查者需要知道的信息
```

### PR最佳实践

1. **保持PR小而专注**
   - 一个PR只做一件事
   - 如果改动较大，拆分成多个PR

2. **清晰的描述**
   - 解释"为什么"做这些更改
   - 提供复现步骤或截图

3. **及时响应反馈**
   - 关注审查评论
   - 及时修改代码
   - 保持友好沟通

4. **保持代码整洁**
   - 提交前运行linter
   - 移除调试代码
   - 删除注释掉的代码

---

## 问题反馈

### GitHub Issues

使用GitHub Issues进行bug报告和功能请求。

**Issue标签**:
- `bug`: Bug报告
- `enhancement`: 功能增强
- `documentation`: 文档改进
- `good first issue`: 适合新贡献者
- `help wanted`: 需要帮助

### Issue生命周期

```
Open → In Progress → Review → Closed
           ↓
         Blocked
```

---

## 获得帮助

### 联系方式

- 📧 Email: [your-email@example.com]
- 💬 GitHub Issues: [创建Issue](https://github.com/chyyd/RehabRecordRn/issues)
- 📖 文档: [查看README](README.md)

### 学习资源

- [React Native官方文档](https://reactnative.dev/)
- [TypeScript手册](https://www.typescriptlang.org/docs/)
- [Zustand文档](https://github.com/pmndrs/zustand)
- [React Navigation指南](https://reactnavigation.org/docs/getting-started)
- [Jest测试框架](https://jestjs.io/docs/getting-started)

---

## 认可贡献者

所有贡献者将被列在项目的 [CONTRIBUTORS.md](CONTRIBUTORS.md) 文件中。

---

## 许可证

通过贡献代码，您同意您的贡献将使用与项目相同的 [MIT许可证](LICENSE) 进行许可。

---

**再次感谢您的贡献！** 🎉

Made with ❤️ by 虎林市中医医院康复科
