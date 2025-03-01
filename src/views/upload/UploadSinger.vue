<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
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

      <!-- 头像URL -->
      <el-form-item label="头像URL" prop="pic">
        <el-input
            v-model="formData.pic"
            placeholder="请输入头像URL"
            class="w-full"
        />
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
import { ElMessage, ElForm } from 'element-plus'

// 表单引用
const formRef = ref(null)

// 表单数据
const formData = reactive({
  name: '',
  sex: null,
  pic: '',
  introduction: ''
})

// 验证规则
const rules = reactive({
  name: [
    { required: true, message: '请输入歌手姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  pic: [
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ]
})

// 提交表单
const submitForm = async () => {
  try {
    // 验证表单
    await formRef.value.validate()
    // 构造请求数据（过滤空字段）
    const payload = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== '')
    )
    // 这里替换为实际的API调用
    const response = await fetch('/singer/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (result.code === 0) {
      ElMessage.success('添加成功')
      formRef.value.resetFields()
    } else {
      ElMessage.error(result.msg || '添加失败')
    }
  } catch (error) {
    ElMessage.error('提交失败，请检查表单')
    console.error('提交错误:', error)
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
:deep(.el-form-item__label) {
  @apply font-medium text-gray-700;
}
</style>
