<script setup lang="ts">
import { useUserStore } from '@/stores/modules/useUserStore'
import {
  Menu as IconMenu,
   Upload, User
} from "@element-plus/icons-vue";

const userStore = useUserStore()

</script>

<template class="w-full h-full flex flex-col">
  <div class="h-full flex flex-col">
    <div class="flex justify-center py-4">


    <div class="w-32 h-32 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center overflow-hidden">
      <img v-if="userStore.user.userInfo.avatar" :src="userStore.user.userInfo.avatar" class="w-full h-full object-cover">
    </div>
  </div>
  <div class="aside-menu flex-1 flex-col border-e border-e-gray-200 min-h-0">
    <el-scrollbar
        class="flex-1 h-full"
    >
    <el-menu
        :default-openeds="['1', '3']"
        class="h-full border-e-0"
        :router="true"
    >
      <!-- 推荐部分 -->
      <el-sub-menu index="1">
        <template #title>
          <el-icon><icon-menu /></el-icon>
          <span class="ms-2">推荐</span>
        </template>
        <el-menu-item index="/hotPlaylists" class="ps-12">热门歌单</el-menu-item>
        <el-menu-item index="/hotSongs" class="ps-12">热门歌曲</el-menu-item>
      </el-sub-menu>

      <!--上传部分-->
      <el-sub-menu v-if="userStore.user.loginStatus" index="2">
        <template #title>
          <el-icon><Upload /></el-icon>
          <span class="ms-2">上传(bata)</span>
        </template>
        <el-menu-item index="/uploadMusic" class="ps-12">上传音乐</el-menu-item>
        <el-menu-item index="/uploadPlaylist" class="ps-12">上传歌单</el-menu-item>
        <el-menu-item index="/uploadSinger" class="ps-12">上传歌手信息</el-menu-item>
      </el-sub-menu>

      <!-- 登录后才显示的收藏部分 -->
      <el-sub-menu v-if="userStore.user.loginStatus" index="3">
        <template #title>
          <el-icon><User /></el-icon>
          <span class="ms-2">我的</span>
        </template>
        <el-menu-item >我收藏的歌曲</el-menu-item>
        <el-menu-item >最近播放</el-menu-item>
        <el-menu-item-group>
          <template #title>
          <span class="ms-2">我的歌单</span>
        </template>
          <el-menu-item index="/myPlaylist">我创建的歌单</el-menu-item>
          <el-menu-item index="/myCollect">我收藏的歌单</el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
    </el-menu>
    </el-scrollbar>
  </div>
  </div>
</template>

<style scoped>
html, body, #app { height: 100%; }
</style>
