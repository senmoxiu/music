<script lang="ts" setup>
import {useUserStore} from '@/stores/modules/useUserStore'
import {Menu as IconMenu, Upload, User} from "@element-plus/icons-vue";
import router from "@/router";

const userStore = useUserStore()

</script>

<template class="w-full h-full flex flex-col">
  <div class="h-full flex flex-col">
    <div class="flex justify-center py-4">
      <div
          @click="router.push('/myInformation')"
          class="w-32 h-32 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center overflow-hidden">
        <img v-if="userStore.user.userInfo.avatar" :src="userStore.user.userInfo.avatar"
             class="w-full h-full object-cover">
      </div>
    </div>
    <div class="aside-menu flex-1 flex-col border-e border-e-gray-200 min-h-0">
      <el-scrollbar
          class="flex-1 h-full"
      >
        <el-menu
            :default-openeds="['1', '3']"
            :router="true"
            class="h-full border-e-0"
        >
          <!-- 推荐部分 -->
          <el-sub-menu index="1">
            <template #title>
              <el-icon>
                <icon-menu/>
              </el-icon>
              <span class="ms-2">推荐</span>
            </template>
            <el-menu-item class="ps-12" index="/hotPlaylists">热门歌单</el-menu-item>
            <el-menu-item class="ps-12" index="/hotSongs">热门歌曲</el-menu-item>
          </el-sub-menu>

          <!--上传部分-->
          <el-sub-menu v-if="userStore.user.loginStatus" index="2">
            <template #title>
              <el-icon>
                <Upload/>
              </el-icon>
              <span class="ms-2">上传(bata)</span>
            </template>
            <el-menu-item class="ps-12" index="/uploadMusic">上传音乐</el-menu-item>
            <el-menu-item class="ps-12" index="/uploadPlaylist">上传歌单</el-menu-item>
            <el-menu-item class="ps-12" index="/uploadSinger">上传歌手信息</el-menu-item>
          </el-sub-menu>

          <!-- 登录后才显示的收藏部分 -->
          <el-sub-menu v-if="userStore.user.loginStatus" index="3">
            <template #title>
              <el-icon>
                <User/>
              </el-icon>
              <span class="ms-2">我的</span>
            </template>
            <el-menu-item index="/mySongCollection">我收藏的歌曲</el-menu-item>
            <el-menu-item index="/recentPlay">最近播放</el-menu-item>
            <el-menu-item-group>
              <template #title>
                <span class="ms-2">我的歌单</span>
              </template>
              <el-sub-menu index="2-1">
                <template #title>
                  <span class="ms-2">我创建的歌单</span>
                </template>
<!--                <el-menu-item v-for="" index="/mySongList"></el-menu-item>-->
              </el-sub-menu>
              <el-sub-menu index="2-2">
                <template #title>
                  <span class="ms-2">我收藏的歌单</span>
                </template>
              </el-sub-menu>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<style scoped>
html, body, #app {
  height: 100%;
}
</style>
