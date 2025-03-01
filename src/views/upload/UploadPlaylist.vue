<template>
  <div class="h-full bg-gray-50 p-8">
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm"
        label-width="120px"
    >
      <!-- 歌单标题 -->
      <el-form-item label="歌单标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入歌单名称"/>
      </el-form-item>

      <!-- 歌单简介 -->
      <el-form-item label="歌单简介" prop="introduction">
        <el-input
            v-model="form.introduction"
            :rows="3"
            placeholder="请输入歌单简介"
            type="textarea"
        />
      </el-form-item>

      <!-- 风格选择 -->
      <el-form-item label="歌单风格" prop="style">
        <el-select v-model="form.style" multiple placeholder="选择风格">
          <el-option
              v-for="style in musicStyles"
              :key="style"
              :label="style"
              :value="style"
          />
        </el-select>
      </el-form-item>

      <!-- 封面图片上传 -->
      <el-form-item label="歌单封面" prop="file">
        <el-upload
            v-model:file-list="coverFiles"
            :auto-upload="false"
            :limit="1"
            :on-change="handleCoverChange"
            accept="image/*"
            list-type="picture-card"
        >
          <el-icon>
            <Plus />
          </el-icon>
          <template #file="{ file }">
            <img :src="file.url" class="w-full h-full object-cover">
          </template>
        </el-upload>
        <div class="text-gray-500 text-xs mt-2">建议尺寸：800x800px，支持JPG/PNG格式</div>
      </el-form-item>

      <!-- 提交按钮 -->
      <div class="flex justify-end mt-8">
        <el-button
            :loading="submitting"
            type="primary"
            @click="submitForm"
        >
          创建歌单
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { Plus } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import {addSongList} from "@/api/api.ts";
import {useUserStore} from "@/stores/modules/useUserStore.ts";




interface PlaylistForm {
  title: string
  introduction: string
  style: string[]
  userId: number | null
}

const formRef = ref()
const coverFiles = ref<UploadFile[]>([])
const submitting = ref(false)
const useUser = useUserStore()

const form = reactive<PlaylistForm>({
  title: '',
  introduction: '',
  style: [],
  userId: null
})

const musicStyles = [
  '流行', '摇滚', '电子', '爵士',
  '古典', '民谣', '说唱', 'R&B'
]

const rules = {
  title: [
    { required: true, message: '请输入歌单标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
  ],
  introduction: [
    { required: true, message: '请输入歌单简介', trigger: 'blur' }
  ],
  style: [
    { type: 'array', required: true, message: '请选择至少一个风格', trigger: 'change' }
  ],
}

const handleCoverChange = (file: UploadFile) => {
  if (file.raw?.type.startsWith('image/')) {
    file.url = URL.createObjectURL(file.raw)
  }
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    const userId = useUser.user.userInfo.id
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('introduction', form.introduction)
    formData.append('style', form.style.join(','))
    formData.append('userId', userId.toString())

    if (coverFiles.value[0]?.raw) {
      formData.append('file', coverFiles.value[0].raw)
    }

    await addSongList(formData)
    ElMessage.success('歌单创建成功')
    formRef.value.resetFields()
    coverFiles.value = []
  } catch (error) {
    ElMessage.error('创建失败: ' + error)
    console.error(error)
  } finally {
    submitting.value = false
  }
}

</script>
