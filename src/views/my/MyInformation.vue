
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/useUserStore'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import dayjs from "dayjs";
import type { UploadProps } from 'element-plus'
import {updateUserInfo} from "@/api/api.ts";

const userStore = useUserStore()
const dialogVisible = ref(false)
const formData = ref({...userStore.user.userInfo})
const uploadFile = ref<File>()

// 处理头像上传
const handleAvatarChange: UploadProps['onChange'] = (file) => {
  uploadFile.value = file.raw
  formData.value.avatar = URL.createObjectURL(file.raw!)
}

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = /\.(jpeg|jpg|png|gif)$/i.test(file.name)
  const isLt2M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('仅支持图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过10MB!')
    return false
  }
  return true
}

// 初始化表单数据
const initFormData = () => {
  formData.value = {...userStore.user.userInfo}
}

// 提交修改
const submitUpdate = async () => {
  try {
    const formPayload = new FormData()

    // 处理特殊字段格式
    const processedData = {
      ...formData.value,
      // 转换生日格式为yyyy-MM-dd HH:mm:ss
      birth: formData.value.birth ? dayjs(formData.value.birth).format('YYYY-MM-DD HH:mm:ss') : '',
      // 转换手机号字段名
      phoneNum: formData.value.phone,
      // 移除不需要的字段
      createTime: undefined,
      updateTime: undefined
    }

    // 构建表单数据（过滤undefined值）
    Object.entries(processedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // 处理avatar作为查询参数
        if (key === 'avatar') {
          formPayload.append(key, value.toString())
        } else {
          formPayload.append(key, value.toString())
        }
      }
    })

    // 添加头像文件（字段名必须为file）
    if (uploadFile.value) {
      formPayload.append('file', uploadFile.value)
    }

    // 调用更新接口
    const res = await updateUserInfo(formPayload)
    if (res.code === 100200) {
      ElMessage.success('修改成功')
      // 更新存储时处理返回数据
      userStore.user.userInfo = {
        ...userStore.user.userInfo,
        ...processedData,
        // 保持原始创建时间
        createTime: userStore.user.userInfo.createTime
      }
      dialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('修改失败')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 头部信息 -->
      <div class="flex items-center gap-6 mb-8">
        <el-avatar :src="userStore.user.userInfo.avatar" :size="100" />
        <div>
          <h2 class="text-2xl font-bold">{{ userStore.user.userInfo.username }}</h2>
          <p class="text-gray-500">ID: {{ userStore.user.userInfo.id }}</p>
        </div>
      </div>

      <!-- 详细信息 -->
      <el-descriptions title="个人信息" border column={2}>
        <el-descriptions-item label="性别">
          {{ userStore.user.userInfo.sex === 1 ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userStore.user.userInfo.email || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ userStore.user.userInfo.phoneNum || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="地区">
          {{ userStore.user.userInfo.location || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="出生日期">
          {{ userStore.user.userInfo.birth || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ dayjs(userStore.user.userInfo.createTime).format('YYYY-MM-DD') }}
        </el-descriptions-item>
        <el-descriptions-item label="个人简介" span={2}>
          {{ userStore.user.userInfo.introduction || '暂无简介' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-6 flex justify-end">
        <el-button type="primary" @click="dialogVisible = true; initFormData()">
          修改信息
        </el-button>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改个人信息" width="50%">
      <el-form :model="formData" label-width="80px">
        <div class="grid grid-cols-2 gap-4">
          <!-- 新增头像上传 -->
          <el-form-item label="头像">
            <el-upload
                :auto-upload="false"
                :before-upload="beforeAvatarUpload"
                :on-change="handleAvatarChange"
                :show-file-list="false"
                class="avatar-uploader"
            >
              <el-avatar :src="formData.avatar" :size="100" class="cursor-pointer">
                <span v-if="!formData.avatar" class="text-gray-500">点击上传</span>
              </el-avatar>
            </el-upload>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="formData.username" disabled />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="formData.sex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="formData.phone" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="formData.email" />
          </el-form-item>
          <el-form-item label="出生日期">
            <el-date-picker
              v-model="formData.birth"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="地区">
            <el-input v-model="formData.location" />
          </el-form-item>
        </div>
        <el-form-item label="个人简介">
          <el-input
            v-model="formData.introduction"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpdate">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>
