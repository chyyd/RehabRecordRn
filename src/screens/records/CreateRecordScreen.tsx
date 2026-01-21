/**
 * 创建治疗记录屏幕
 * iOS 设计风格
 * 支持扫码和手动输入来源识别
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRecordStore, usePatientStore, useAuthStore } from '@/stores';
import { recordApi, patientApi } from '@/services/api';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '@/theme';
import SignaturePad from '@/components/SignaturePad';
import type { Patient, TreatmentProject } from '@/types';

interface RecentProject {
  projectId: number;
  projectName: string;
  count: number;
}

interface RouteParams {
  patientId: string | number;
  from?: 'scan' | 'manual' | 'detail';
}

const CreateRecordScreen = () => {
  const theme = useTheme();
  const route = useRoute();
  const params = route.params as RouteParams;
  const navigation = useNavigation();

  const { projects, fetchProjects } = useRecordStore();
  const { patients } = usePatientStore();
  const userInfo = useAuthStore(state => state.userInfo);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedProject, setSelectedProject] = useState<TreatmentProject | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [showSignature, setShowSignature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [fromSource, setFromSource] = useState<'scan' | 'manual' | 'detail'>('detail');
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [actualPatientId, setActualPatientId] = useState<number | null>(null);

  // 🔄 过滤逻辑已简化：后端 /projects/my API 根据用户身份返回可操作项目
  // 前端直接使用后端返回的项目列表，无需再次过滤
  console.log('📋 后端返回的治疗项目数:', projects?.length || 0);

  // 处理来源信息和患者ID解析
  useEffect(() => {
    if (params?.from) {
      setFromSource(params.from);
      console.log('✅ 页面来源:', params.from);
    }

    if (typeof params.patientId === 'number') {
      console.log('📌 患者ID（数字）:', params.patientId);
      setActualPatientId(params.patientId);
    } else {
      console.log('📌 病历号（字符串）:', params.patientId);
    }
  }, [params?.from, params?.patientId]);

  useEffect(() => {
    // 加载治疗项目
    fetchProjects();

    // 查找患者信息
    let foundPatient: Patient | null = null;

    if (typeof params.patientId === 'number') {
      // 情况1：从患者详情页过来，params.patientId 是患者 ID
      foundPatient = patients.find((p) => p.id === params.patientId) || null;
      if (foundPatient) {
        console.log('✅ 在本地找到患者（通过ID）:', foundPatient);
        setActualPatientId(foundPatient.id);
      }
    } else {
      // 情况2：从扫码/手动输入过来，params.patientId 是病历号字符串
      foundPatient = patients.find((p) => p.medicalRecordNo === params.patientId) || null;
      if (foundPatient) {
        console.log('✅ 在本地找到患者（通过病历号）:', foundPatient);
        setActualPatientId(foundPatient.id);
      } else {
        console.log('⚠️ 本地未找到病历号为:', params.patientId, '的患者，从API搜索');
        searchPatientByMedicalNo(params.patientId);
        return;
      }
    }

    if (foundPatient) {
      setPatient(foundPatient);
      loadRecentProjects(foundPatient.id);
    }
  }, [params?.patientId]);

  /**
   * 加载患者最近使用的治疗项目
   * 从最近7天的治疗记录中统计
   * @param patientId 患者ID（数字）
   */
  const loadRecentProjects = useCallback(async (patientId: number) => {
    try {
      setLoadingRecent(true);

      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startDate = formatDate(sevenDaysAgo);
      const endDate = formatDate(today);

      console.log('查询日期范围:', startDate, '至', endDate);

      const response = await recordApi.getRecords({
        patientId,
        startDate,
        endDate,
      });

      console.log('📦 完整响应对象:', JSON.stringify(response, null, 2));

      const responseData = response as any;
      let records: any[] = [];

      if (responseData.data && Array.isArray(responseData.data.data)) {
        records = responseData.data.data;
        console.log('✅ 使用格式1: PaginatedResponse');
      } else if (Array.isArray(responseData.data)) {
        records = responseData.data;
        console.log('✅ 使用格式2: 直接数组');
      } else if (Array.isArray(responseData)) {
        records = responseData;
        console.log('✅ 使用格式3: response 本身是数组');
      }

      console.log('解析后的记录数量:', records.length);
      console.log('records 内容:', records);

      if (records && records.length > 0) {
        console.log('✅ 进入统计逻辑，患者最近7天治疗记录:', records.length);

        const projectStats = new Map<number, { count: number; name: string; code: string }>();

        records.forEach((record: any) => {
          const projectId = record.project?.id;

          if (projectId) {
            const existing = projectStats.get(projectId);
            if (existing) {
              existing.count++;
            } else {
              projectStats.set(projectId, {
                count: 1,
                name: record.project?.name || '未知项目',
                code: record.project?.code || '',
              });
            }
          }
        });

        let sortedProjects = Array.from(projectStats.entries())
          .map(([projectId, data]) => ({
            projectId,
            projectName: data.name,
            count: data.count,
          }))
          .sort((a, b) => b.count - a.count);

        // 🔑 关键步骤：筛选出当前用户可操作的项目
        // 🔄 使用后端 /projects/my 返回的项目列表（已根据用户角色过滤）
        if (projects && projects.length > 0) {
          const userProjectIds = new Set(projects.map((p) => p.id));
          console.log('👤 当前用户可操作项目ID列表:', Array.from(userProjectIds));

          const beforeFilter = sortedProjects.length;
          sortedProjects = sortedProjects.filter((p) => userProjectIds.has(p.projectId));
          console.log('🔒 筛选后项目数:', sortedProjects.length, '个（过滤了', beforeFilter - sortedProjects.length, '个）');
        } else {
          console.log('⚠️ 用户可操作项目列表为空，跳过筛选');
        }

        sortedProjects = sortedProjects.slice(0, 6);
        setRecentProjects(sortedProjects);
        console.log('✅ 患者常用项目统计（最终结果）:', sortedProjects);
      } else {
        setRecentProjects([]);
        console.log('⚠️ 该患者最近7天无治疗记录或数据为空');
      }
    } catch (error) {
      console.error('❌ 加载患者最近项目失败:', error);
      setRecentProjects([]);
    } finally {
      setLoadingRecent(false);
    }
  }, [projects]); // 添加 projects 依赖，避免闭包问题

  /**
   * 快捷选择项目并开始治疗
   */
  const handleQuickSelectProject = useCallback(
    async (recentProject: RecentProject) => {
      const project = projects.find((p) => p.id === recentProject.projectId);

      if (project) {
        setSelectedProject(project);
        await startTreatment(project);
      } else {
        Alert.alert('错误', '未找到该治疗项目');
      }
    },
    [projects]
  );

  /**
   * 选择项目并开始治疗
   * 🔄 已简化权限检查：后端 /projects/my 已返回用户有权限的项目
   */
  const handleSelectProject = useCallback(
    async (project: TreatmentProject) => {
      setSelectedProject(project);
      await startTreatment(project);
    },
    []
  );

  /**
   * 开始治疗流程（接收项目作为参数）
   */
  const startTreatment = async (project: TreatmentProject) => {
    if (!project) {
      Alert.alert('提示', '请先选择治疗项目');
      return;
    }

    console.log('🚀 开始治疗流程，项目:', project);
    setValidating(true);

    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      setValidating(false);
      setShowSignature(true);
    } catch (error) {
      console.error('❌ 验证时间冲突失败:', error);
      setValidating(false);

      const errorMessage = error instanceof Error ? error.message : '未知错误';
      Alert.alert('验证失败', `无法验证时间冲突，是否继续治疗记录？\n错误: ${errorMessage}`, [
        { text: '取消', style: 'cancel' },
        { text: '继续', onPress: () => setShowSignature(true) },
      ]);
    }
  };

  /**
   * 签名确认
   */
  const handleSignatureConfirm = async (imageData: string) => {
    console.log('🖋 签名确认:', imageData);

    setSignature(imageData);
    setShowSignature(false);
    setSaving(true);

    try {
      const startTime = new Date();

      if (!selectedProject) {
        throw new Error('未选择治疗项目');
      }

      if (!actualPatientId) {
        throw new Error('患者ID不存在');
      }

      await recordApi.createRecord({
        patientId: actualPatientId,
        projectId: selectedProject.id,
        startTime: startTime.toISOString(),
        endTime: startTime.toISOString(),
        durationMinutes: selectedProject.defaultDuration,
        patientReaction: '无不良反应',
        signatureImage: imageData,
        notes: '',
      });

      Alert.alert('成功', '治疗记录已保存', [
        {
          text: '返回扫码页',
          onPress: () => {
            goBackToScan();
          },
        },
      ]);
    } catch (error) {
      console.error('❌ 保存记录失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      Alert.alert('保存失败', errorMessage || '请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 根据病历号从 API 搜索患者
   */
  const searchPatientByMedicalNo = async (medicalNo: string) => {
    try {
      setLoadingPatient(true);
      const searchResults = await patientApi.searchPatients(medicalNo);
      console.log('🔍 API 搜索患者结果:', searchResults);

      if (searchResults && searchResults.length > 0) {
        const foundPatient = searchResults.find((p: Patient) => p.medicalRecordNo === medicalNo);
        if (foundPatient) {
          console.log('✅ 从 API 找到患者:', foundPatient);
          setPatient(foundPatient);
          setActualPatientId(foundPatient.id);
          loadRecentProjects(foundPatient.id);
        }
      } else {
        Alert.alert('未找到患者', `病历号 ${medicalNo} 不存在`);
      }
    } catch (error) {
      console.error('❌ 搜索患者失败:', error);
      Alert.alert('搜索失败', '无法找到患者信息，请稍后重试');
    } finally {
      setLoadingPatient(false);
    }
  };

  /**
   * 返回扫码页
   */
  const goBackToScan = () => {
    console.log('🔄 返回扫码页');

    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' as never }, { name: 'Scan' as never }],
    });
  };

  // 检查是否有患者信息
  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{loadingPatient ? '搜索患者中...' : '加载中...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 患者信息卡片 */}
      <View style={styles.patientCard}>
        <View style={styles.patientHeader}>
          <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>{patient.name?.substring(0, 1)}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientNo}>{patient.medicalRecordNo}</Text>
            {userInfo?.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {userInfo.role === 'admin' && '管理员'}
                  {userInfo.role === 'physician' && '医师'}
                  {userInfo.role === 'therapist' && '治疗师'}
                  {userInfo.role === 'nurse' && '护士'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 最近使用 */}
      {recentProjects.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>⚡ 最近使用</Text>
          <View style={styles.recentProjectsGrid}>
            {recentProjects.map((project) => (
              <TouchableOpacity
                key={project.projectId}
                style={[
                  styles.recentProjectCard,
                  selectedProject?.id === project.projectId && styles.activeRecentCard,
                ]}
                onPress={() => handleQuickSelectProject(project)}
                activeOpacity={0.7}>
                <View style={styles.recentProjectIcon}>
                  <Text style={styles.recentProjectEmoji}>⚡</Text>
                </View>
                <View style={styles.recentProjectInfo}>
                  <Text style={styles.recentProjectName}>{project.projectName}</Text>
                  <Text style={styles.recentProjectCount}>已使用 {project.count} 次</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* 治疗项目选择 */}
      <Text style={styles.sectionTitle}>
        {showAllProjects || recentProjects.length === 0 ? '选择治疗项目' : '更多项目'}
      </Text>
      <View style={styles.projectsList}>
        {projects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.projectItem,
              selectedProject?.id === project.id && styles.activeProject,
            ]}
            onPress={() => handleSelectProject(project)}
            activeOpacity={0.7}>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectDuration}>{project.defaultDuration} 分钟</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 签名组件 */}
      <SignaturePad
        visible={showSignature}
        onConfirm={handleSignatureConfirm}
        onClose={() => setShowSignature(false)}
      />

      {/* 验证中提示 */}
      {validating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>验证中...</Text>
        </View>
      )}

      {/* 保存中提示 */}
      {saving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>保存中...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  patientCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.brand.blue,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  patientNo: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  roleBadge: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  recentProjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  recentProjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.md,
    marginRight: Spacing.xs,
  },
  activeRecentCard: {
    backgroundColor: Colors.brand.blue,
    borderColor: Colors.brand.blue,
  },
  recentProjectIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  recentProjectEmoji: {
    fontSize: 24,
  },
  recentProjectInfo: {
    flex: 1,
  },
  recentProjectName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  recentProjectCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  projectsList: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.sm,
  },
  activeProject: {
    backgroundColor: Colors.brand.blue,
    borderColor: Colors.brand.blue,
  },
  projectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    flex: 1,
  },
  projectDuration: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginLeft: Spacing.sm,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateRecordScreen;
