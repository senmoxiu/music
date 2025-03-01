<template>
  <div class="max-w-md mx-auto p-6 bg-gray-50 p-8 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-6">添加歌手</h2>
    <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        class="demo-ruleForm"
    >
      <!-- 歌手姓名 -->
      <el-form-item label="歌手姓名" prop="name">
        <el-input
            v-model="formData.name"
            placeholder="请输入歌手姓名"
            class="w-full"
        />
      </el-form-item>

      <!-- 性别 -->
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 头像上传 -->
      <el-form-item label="歌手头像" prop="imageFile">
        <el-upload
            v-model:file-list="avatarFiles"
            :auto-upload="false"
            :limit="1"
            :on-change="handleAvatarChange"
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
      </el-form-item>

      <!-- 简介 -->
      <el-form-item label="简介" prop="introduction">
        <el-input
            v-model="formData.introduction"
            type="textarea"
            :rows="4"
            placeholder="请输入歌手简介"
            class="w-full"
        />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item class="mt-6">
        <el-button
            type="primary"
            @click="submitForm"
            class="w-full"
        >
          提交
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { addSinger } from '@/api/api'

const formRef = ref(null)
const avatarFiles = ref([])

const formData = reactive({
  name: '',
  sex: null,
  introduction: ''
})

const rules = reactive({
  name: [
    { required: true, message: '请输入歌手姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
})

const handleAvatarChange = (file) => {
  if (file.raw?.type.startsWith('image/')) {
    file.url = URL.createObjectURL(file.raw)
  }
}

const submitForm = async () => {
  try {
    await formRef.value.validate()

    const form = new FormData()
    form.append('name', formData.name)
    form.append('sex', formData.sex)
    form.append('introduction', formData.introduction)

    if (avatarFiles.value[0]?.raw) {
      form.append('imageFile', avatarFiles.value[0].raw)
    }

    const response = await addSinger(form) // 使用封装好的API方法

    if (response.code === 100200) {
      ElMessage.success('添加成功')
      formRef.value.resetFields()
      avatarFiles.value = []
    }
  } catch (error) {
    ElMessage.error('提交失败: ' + error.message)
    console.error('提交错误:', error)
  }
}
</script>


<style scoped>

</style>
