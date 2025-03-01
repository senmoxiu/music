<script lang="ts" setup>
import {ArrowDown, Plus, Search} from '@element-plus/icons-vue'
import {useUserStore} from '@/stores/modules/useUserStore'
import {getUserId, getUserInfo, login, logout, register} from '@/api/api.ts'
import {ElMessage, type FormInstance, type UploadProps} from "element-plus";
import dayjs from 'dayjs'

const userStore = useUserStore()
const loginStatus = computed(() => userStore.user.loginStatus)
const userInfo = computed(() => userStore.user.userInfo)
const router = useRouter()
const loginDialog = reactive({
  username: '',
  password: '',
})

const handleSearch = () => {
//搜索功能
}

//登录按键
const handleLogin = ref(false);

//登录接口
const loginProcessing = () => {
  login(loginDialog)
      .then((res) => {
        let code = res.code
        if (code === 100200) {
          handleLogin.value = false
          userStore.user.loginStatus = true
          getUserId(null)
              .then((res) => {
                userStore.user.userInfo.id = res
                handleUserInfo(userStore.user.userInfo.id)
              })
        } else {
          ElMessage.error(res.msg)
        }
      })
}

//登录用户信息
const handleUserInfo = (id: number) => {
  getUserInfo(id)
      .then((res) => {
        userStore.user.userInfo = res.data
      })
}


const handleLogout = () => {
//退出登录功能
  userStore.resetUser()
  logout(null)
  router.push('/')
}

// 注册弹窗控制
const dialogVisible = ref(false)

const formRef = ref<FormInstance>()

// 文件上传临时存储
const uploadFile = ref<File>()

// 表单数据（根据接口文档调整字段）
const formData = reactive({
  username: '',
  password: '',
  sex: 1,         // 1-男，0-女
  phoneNum: '',
  email: '',
  introduction: '',
  location: '',
  avatar: '',
  birth: ''       // 新增出生日期字段
})

// 验证规则
const formRules = reactive({
  username: [
    {required: true, message: '账号不能为空', trigger: 'blur'},
    {pattern: /^[a-zA-Z0-9]{4,16}$/, message: '4-16位字母数字'}
  ],
  password: [
    {required: true, message: '密码不能为空', trigger: 'blur'},
    {min: 6, max: 18, message: '6-18位字符'}
  ],
  phoneNum: [
    {required: true, message: '手机号不能为空', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号'}
  ],
  email: [
    {required: true, message: '邮箱不能为空', trigger: 'blur'},
    {type: 'email', message: '邮箱格式错误'}
  ]
})

// 文件处理
const handleAvatarChange: UploadProps['onChange'] = (file) => {
  uploadFile.value = file.raw
  formData.avatar = URL.createObjectURL(file.raw!)
}

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

// 提交表单
const submitForm = async () => {
  try {
    if (formData.birth) {
      formData.birth = dayjs(formData.birth).format('YYYY-MM-DD')
    }

    await formRef.value?.validate()
    const formPayload = new FormData()

    // 1. 构建标准表单数据（与接口参数一一对应）
    const formFields = {
      username: formData.username,
      password: formData.password,
      sex: formData.sex,
      phoneNum: formData.phoneNum,
      email: formData.email,
      introduction: formData.introduction || '',
      location: formData.location || '',
      birth: formData.birth || '',
      avatar: '' // 由后端处理头像路径
    }

    // 2. 填充表单数据（兼容数字类型）
    Object.entries(formFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formPayload.append(key, value.toString())
      }
    })

    // 3. 处理文件上传（字段名必须为 file）
    if (uploadFile.value) {
      formPayload.append('file', uploadFile.value)
    }
    if (formData.birth) {
      const pureDate = formData.birth.split('T')[0] // 二次清理
      formPayload.append('birth', pureDate)
    }
    // 4. 发送请求（明确类型）
    const res = await register(formPayload)

    if (res.code === 100200) {
      ElMessage.success('注册成功')
      // 完全重置表单
      formRef.value?.resetFields()
      uploadFile.value = undefined
      if (formData.avatar) {
        URL.revokeObjectURL(formData.avatar)
      }
      Object.assign(formData, {
        username: '',
        password: '',
        sex: 1,
        phoneNum: '',
        email: '',
        introduction: '',
        location: '',
        birth: '',
        avatar: ''
      })
      dialogVisible.value = false
    } else {
      ElMessage.error(res.msg || '注册失败')
    }
  } catch (error: any) {
    // 优化错误处理
    if (error?.response?.data) {
      const {code, msg} = error.response.data
      if (code === 100401) {
        ElMessage.error('认证失败，请重新登录')
      } else {
        ElMessage.error(msg || `请求错误 (${code})`)
      }
    } else if (error.message?.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求失败: ' + error.message)
    }
  }
}

// 暴露打开弹窗方法
defineExpose({
  open: () => {
    dialogVisible.value = true
    // 重置表单状态
    formRef.value?.clearValidate()
  }
})

</script>

<template>
  <header
      class="fixed top-0 left-0 w-full h-16 z-50 bg-white/80 backdrop-blur-md shadow-md flex items-center px-6 justify-between">
    <router-link class="flex items-center space-x-2 pb-2" to="/">
      <el-image class="w-10 h-10 rounded-full border-2 border-gray-300" src="public/logo-1.png"/>
      <span class="text-xl font-bold text-gray-800">音乐播放器</span>
    </router-link>
    <div class="flex-1 max-w-2xl mx-6 pb-2">
      <el-input

          :prefix-icon="Search"
          class="!rounded-full px-4 border-gray-300"
          placeholder="搜索歌曲/歌手"
          @keyup.enter="handleSearch"
      />
    </div>
    <div class="flex items-center space-x-4 pb-2">
      <template v-if="!loginStatus">
        <el-button
            class="!rounded-full"
            plain
            type="primary"
            @click="handleLogin=true"
        >
          登录
        </el-button>
        <el-button
            class="!rounded-full"
            plain
            type="primary"
            @click="dialogVisible=true"
        >
          注册
        </el-button>
      </template>
      <template v-else>
        <el-avatar :src="userInfo.avatar" class="!rounded-full" size="default"/>
        <el-dropdown>
          <div class="flex items-center space-x-1 cursor-pointer">
            <span class="text-gray-700">{{ userInfo.username }}</span>
            <el-icon>
              <ArrowDown/>
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              <el-dropdown-item>个人中心</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
  </header>

  <!-- 登录弹窗 -->
  <el-dialog v-model="handleLogin" title="登录" width="30%">
    <el-form :model="loginDialog">
      <el-form-item label="用户名">
        <el-input v-model="loginDialog.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginDialog.password" placeholder="请输入密码" type="password"></el-input>
      </el-form-item>
    </el-form>
    <div>
      <el-button @click="handleLogin=false">取消</el-button>
      <el-button type="primary" @click="loginProcessing">登录</el-button>
    </div>
  </el-dialog>

  <!-- 注册弹窗 -->
  <el-dialog
      v-model="dialogVisible"
      title="用户注册"
      width="800px"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        class="px-4 py-2"
        label-width="90px"
    >
      <!-- 头像上传 -->
      <el-form-item label="头像" prop="avatar">
        <el-upload
            :auto-upload="false"
            :before-upload="beforeAvatarUpload"
            :on-change="handleAvatarChange"
            :show-file-list="false"
            class="avatar-uploader"
        >
          <div
              class="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center overflow-hidden">
            <img v-if="formData.avatar" :src="formData.avatar" class="w-full h-full object-cover">
            <el-icon v-else class="text-3xl text-gray-400">
              <Plus/>
            </el-icon>
          </div>
        </el-upload>
      </el-form-item>

      <!-- 基本信息 -->
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="formData.username"
              class="!w-full"
              placeholder="4-16位字母数字"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="formData.password"
              class="!w-full"
              placeholder="6-18位字符"
              show-password
              type="password"
          />
        </el-form-item>

        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formData.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="手机号" prop="phoneNum">
          <el-input
              v-model="formData.phoneNum"
              class="!w-full"
              placeholder="11位手机号"
          />
        </el-form-item>

        <!-- 新增出生日期字段 -->
        <el-form-item label="出生日期" prop="birth">
          <el-date-picker
              v-model="formData.birth"
              :format="'YYYY-MM-DD'"
              :value-format="'YYYY-MM-DD'"
              class="!w-full"
              placeholder="选择日期"
              type="date"
          />
        </el-form-item>
      </div>

      <el-form-item label="邮箱" prop="email">
        <el-input
            v-model="formData.email"
            class="!w-full"
            placeholder="请输入邮箱"
        />
      </el-form-item>

      <el-form-item label="地区" prop="location">
        <el-input
            v-model="formData.location"
            class="!w-full"
            placeholder="请输入地区"
        />
      </el-form-item>

      <el-form-item label="个人简介" prop="introduction">
        <el-input
            v-model="formData.introduction"
            :rows="3"
            class="!w-full"
            placeholder="请输入简介"
            type="textarea"
        />
      </el-form-item>

      <div class="flex justify-end gap-3 mt-6">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<style scoped>

</style>
