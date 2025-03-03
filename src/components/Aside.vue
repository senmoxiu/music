<script lang="ts" setup>
import {useUserStore} from '@/stores/modules/useUserStore'
import {Menu as IconMenu, Upload, User} from "@element-plus/icons-vue";
import router from "@/router";
import {getCollectSongList} from "@/api/api.ts";
interface CollectPlaylist {
  id: number
  title: string
  pic: string
  introduction: string
  style: string
  userId: number
}

const collectSongList = ref<CollectPlaylist[]>([])
const userStore = useUserStore()
onMounted(async () => {
  if (userStore.user.loginStatus){
    const res = await getCollectSongList(userStore.user.userInfo.id)
    collectSongList.value = res.data
    console.log(collectSongList.value)
  }
})
</script>

<template class="w-full h-full flex flex-col">
  <div class="h-full flex flex-col">
    <div class="flex justify-center py-4">
      <div
          class="w-32 h-32 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center overflow-hidden"
          @click="router.push('/myInformation')">
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
            <el-menu-item class="ps-12" index="/hotPlaylists">推荐歌单</el-menu-item>
<!--            <el-menu-item class="ps-12" index="/hotSongs">推荐歌曲</el-menu-item>-->
          </el-sub-menu>

          <!--上传部分 除歌单上传外，其他的后续转到后台系统-->
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
            <el-menu-item class="ps-12" index="/songUploadList">歌曲上传歌单</el-menu-item>
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
            <el-sub-menu index="2-2">
              <template #title>
                <span class="ms-2">我收藏的歌单</span>
              </template>
              <template v-if="collectSongList.length > 0">
                <el-menu-item
                    v-for="item in collectSongList"
                    :key="item.id"
                    :index="'/playlist/' + item.id">
                  {{ item.title }}
                </el-menu-item>
              </template>
              <el-menu-item v-else disabled>
                {{ collectSongList.length === 0 ? '暂无收藏歌单' : '加载中...' }}
              </el-menu-item>
            </el-sub-menu>
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
