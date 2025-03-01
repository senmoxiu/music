<!-- 多步骤表单组件 -->
<template>
  <!-- 步骤指示器 -->
  <div class="h-full bg-gray-50 p-8">
    <!-- 步骤进度条 -->
    <el-steps :active="activeStep" class="max-w-3xl mx-auto mb-8" finish-status="success">
      <el-step title="基本信息"/>
      <el-step title="文件上传"/>
      <el-step title="确认提交"/>
    </el-steps>

    <!-- 主表单容器 -->
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm"
        label-width="120px"
    >
      <!-- 步骤1：歌曲元数据输入 -->
      <div v-show="activeStep === 0">
        <!-- 歌曲名称输入 -->
        <el-form-item label="歌名" prop="name">
          <el-input v-model="form.name" placeholder="请输入歌曲名称"/>
        </el-form-item>

        <!-- 歌手信息双字段布局：ID与名称组合输入 -->
        <el-form-item label="歌手信息" required>
          <div class="flex gap-4">
            <el-form-item class="flex-1" prop="singerId">
              <el-input
                  v-model.number="form.singerId"
                  placeholder="歌手ID"
                  type="number"
              />
            </el-form-item>
            <el-form-item class="flex-1" prop="singerName">
              <el-input v-model="form.singerName" placeholder="歌手名称"/>
            </el-form-item>
          </div>
        </el-form-item>

        <!-- 多选风格选择器 -->
        <el-form-item label="歌曲风格" prop="style">
          <el-select v-model="form.style" multiple placeholder="选择风格">
            <el-option
                v-for="style in musicStyles"
                :key="style"
                :label="style"
                :value="style"
            />
          </el-select>
        </el-form-item>

        <!-- 歌曲简介多行输入 -->
        <el-form-item label="歌曲简介" prop="introduction">
          <el-input
              v-model="form.introduction"
              :rows="3"
              placeholder="请输入歌曲简介"
              type="textarea"
          />
        </el-form-item>
      </div>

      <!-- 步骤2：多媒体文件上传 -->
      <div v-show="activeStep === 1">
        <!-- 封面图片上传组件 -->
        <el-form-item label="歌曲封面" prop="coverFile">
          <el-upload
              v-model:file-list="coverFiles"
              :auto-upload="false"
              :limit="1"
              :on-change="handleCoverChange"
              accept="image/*"
              list-type="picture-card"
          >
            <el-icon>
              <Plus/>
            </el-icon>
            <template #file="{ file }">
              <img :src="file.url" class="w-full h-full object-cover">
            </template>
          </el-upload>
          <div class="text-gray-500 text-xs mt-2">建议尺寸：800x800px，支持JPG/PNG格式</div>
        </el-form-item>

        <!-- 音乐文件上传组件 -->
        <el-form-item label="音乐文件" prop="musicFile">
          <el-upload
              v-model:file-list="musicFiles"
              :auto-upload="false"
              :limit="1"
              :on-change="handleMusicChange"
              accept="audio/*"
          >
            <el-button type="primary">选择音乐文件</el-button>
            <template #tip>
              <div class="text-gray-500 text-xs mt-2">
                支持MP3/WAV格式，最大50MB
                <span v-if="previewUrl" class="ml-4">
                  试听片段：<audio :src="previewUrl" class="h-8 align-middle" controls/>
                </span>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 歌词文件上传组件：支持特定格式 -->
        <el-form-item label="歌词文件" prop="lyricFile">
          <el-upload
              v-model:file-list="lyricFiles"
              :auto-upload="false"
              :limit="1"
              accept=".lrc,.txt"
          >
            <el-button type="primary">选择歌词文件</el-button>
          </el-upload>
        </el-form-item>
      </div>

      <!-- 步骤3：确认提交 -->
      <div v-show="activeStep === 2" class="confirm-panel">
        <!-- 信息汇总展示：表格化显示所有提交内容 -->
        <el-descriptions :column="1" border>
          <el-descriptions-item label="歌曲名称">{{ form.name }}</el-descriptions-item>
          <el-descriptions-item label="歌手信息">{{ form.singerName }} (ID: {{ form.singerId }})</el-descriptions-item>
          <el-descriptions-item label="音乐风格">{{ form.style.join(', ') }}</el-descriptions-item>
          <el-descriptions-item label="音乐文件">{{ musicFiles[0]?.name }}</el-descriptions-item>
          <el-descriptions-item label="封面文件">{{ coverFiles[0]?.name || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 表单操作按钮组：导航和提交控制 -->
      <div class="flex justify-between mt-8">
        <el-button :disabled="activeStep === 0" @click="activeStep--">
          上一步
        </el-button>

        <el-button
            v-if="activeStep < 2"
            type="primary"
            @click="validateStep"
        >
          下一步
        </el-button>

        <el-button
            v-else
            :loading="submitting"
            type="success"
            @click="submitForm"
        >
          确认提交
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import {Plus} from '@element-plus/icons-vue'
import type {UploadFile} from 'element-plus'
import {addSong} from '@/api/api'

/**
 * 歌曲表单数据结构
 * @property {string} name - 歌曲名称
 * @property {number|null} singerId - 歌手ID
 * @property {string} singerName - 歌手姓名
 * @property {string[]} style - 音乐风格数组
 * @property {string} introduction - 歌曲简介
 */
interface SongForm {
  name: string
  singerId: number | null
  singerName: string
  style: string[]
  introduction: string
}

// 响应式状态管理
const activeStep = ref(0) // 当前步骤索引
const submitting = ref(false) // 提交状态标记
const previewUrl = ref<string>('') // 音频预览URL

// 表单引用和文件列表
const formRef = ref() // 表单实例引用
const coverFiles = ref<UploadFile[]>([]) // 封面文件列表
const musicFiles = ref<UploadFile[]>([]) // 音乐文件列表
const lyricFiles = ref<UploadFile[]>([]) // 歌词文件列表

// 响应式表单对象
const form = reactive<SongForm>({
  name: '',
  singerId: null,
  singerName: '',
  style: [],
  introduction: ''
})

const musicStyles = [
  '流行', '摇滚', '电子', '爵士',
  '古典', '民谣', '说唱', 'R&B'
]

const rules = {
  name: [
    {required: true, message: '请输入歌曲名称', trigger: 'blur'},
    {min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur'}
  ],
  singerId: [
    {required: true, message: '请输入歌手ID', trigger: 'blur'},
    {type: 'number', message: '必须为数字值'}
  ],
  singerName: [
    {required: true, message: '请输入歌手名称', trigger: 'blur'}
  ],
  style: [
    {type: 'array', required: true, message: '请选择至少一个风格', trigger: 'change'}
  ],
  musicFile: [
    {required: true, validator: validateMusicFile, trigger: 'change'}
  ],
  coverFile: [
    {required: true, message: '请上传封面图片', trigger: 'change'}
  ]
}

function validateMusicFile(rule: any, value: any, callback: any) {
  if (musicFiles.value.length === 0) {
    callback(new Error('请上传音乐文件'))
  } else {
    const file = musicFiles.value[0].raw
    if (file && file.size > 50 * 1024 * 1024) {
      callback(new Error('文件大小不能超过50MB'))
    } else {
      callback()
    }
  }
}

const handleCoverChange = (file: UploadFile) => {
  if (file.raw?.type.startsWith('image/')) {
    file.url = URL.createObjectURL(file.raw)
  }
}

const handleMusicChange = (file: UploadFile) => {
  if (file.raw?.type.startsWith('audio/')) {
    previewUrl.value = URL.createObjectURL(file.raw)
  }
}

const validateStep = async () => {
  try {
    await formRef.value.validateField(getStepFields())
    activeStep.value++
  } catch (error) {
    ElMessage.error('请正确填写当前步骤的信息')
  }
}

const getStepFields = () => {
  switch (activeStep.value) {
    case 0:
      return ['name', 'singerId', 'singerName', 'style']
    case 1:
      return ['musicFile']
    default:
      return []
  }
}

const submitForm = async () => {
  try {
    submitting.value = true
    const formData = new FormData()

    // 添加表单字段
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, value.join(','))
      } else if (value !== null) {
        formData.append(key, String(value))
      }
    })

    // 添加文件
    if (coverFiles.value[0]?.raw) {
      formData.append('imageFile', coverFiles.value[0].raw) // 参数名修正
    } else {
      ElMessage.error('请上传封面图片')
      return
    }

    formData.append('musicFile', musicFiles.value[0].raw || '')

    if (lyricFiles.value[0]?.raw) {
      formData.append('lyricFile', lyricFiles.value[0].raw)
    }

    // 调用API
    await addSong(formData)
        .then((rse) => {
              if (rse.code === 100200) {
                ElMessage.success('歌曲上传成功')
              } else {
                ElMessage.error('歌曲上传失败' + rse.message)
              }
            }
        )
    resetForm()
  } catch (error) {
    ElMessage.error('上传失败: ' + error?.message)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value.resetFields()
  activeStep.value = 0
  coverFiles.value = []
  musicFiles.value = []
  lyricFiles.value = []
  previewUrl.value = ''
}
</script>

<style scoped>
.confirm-panel {
  padding: 1rem; /* 替换p-4 */
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

.audio-preview {
  max-width: 300px;
  margin-top: 8px;
}
</style>
