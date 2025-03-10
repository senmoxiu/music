<script lang="ts" setup>
import {getCountSong, getSongOfId} from "@/api/api.ts";
import {useSongListStore} from "@/stores/modules/useSongListStore.ts";
import {CaretRight} from "@element-plus/icons-vue";
import {getRecommendPlaylists} from "@/api/api.ts";
import {useUserStore} from "@/stores/modules/useUserStore.ts";
const songList = useSongListStore()
let data = ref<any[]>()
const playlists = ref<any[]>([]);
const userStore = useUserStore();

onMounted(async () => {
  try {
    const res = await getCountSong()
    data.value = res.data.records
  } catch (error) {
    console.error('歌曲加载失败:', error)
  }
  try {
    const userId = userStore.user.userInfo.id;
    const res = await getRecommendPlaylists(userId);
    if (res.code === 100200) {
      playlists.value = res.data.slice(0, 5); // 最多取5个
    }
  } catch (error) {
    console.error('歌单加载失败:', error)
  }
})

import { useRouter } from 'vue-router';
const router = useRouter();

// 添加点击处理函数
const handleCardClick = (playlistId: number) => {
  router.push({
    name: 'Playlist',
    params: { id: playlistId }
  });
};

const playSong = async (id: number) => {
  const res = await getSongOfId(id)
  await songList.addToPlaylist(res.data)
  await nextTick()
}
</script>

<template>
  <el-scrollbar>
    <el-carousel
        :interval="4000"
        class="mx-auto max-w-6xl py-8"
        height="200px"
        type="card"
    >
      <el-carousel-item
          v-for="playlist in playlists"
          :key="playlist.id"
          class="[&>.el-carousel__mask]:!bg-transparent
         transition-all duration-300 hover:scale-105
         shadow-lg hover:shadow-xl rounded-xl overflow-hidden"
          @click="handleCardClick(playlist.id)"
      >
        <div class="h-full flex items-center justify-center relative">
          <img
              :src="playlist.pic"
              class="w-full h-full object-cover absolute inset-0 z-0"
              alt="歌单封面"
          >
          <div class="z-10 bg-black/30 p-4 rounded-lg backdrop-blur-sm">
            <h3 class="text-2xl font-bold text-white">{{ playlist.title }}</h3>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    <div>
      <el-table :data="data" class="w-auto">
        <el-table-column
        label="#"
        width="50"
        >
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
            label="封面"
            prop="pic"
        >
          <template #default="scope">
            <el-image :src="scope.row.pic" class="w-12.5"/>
          </template>
        </el-table-column>
        <el-table-column
            label="标题"
            prop="name"
        />
        <el-table-column
            label="歌手"
            prop="singerName"
        />
        <el-table-column
            label="风格"
            prop="style"
        />
        <el-table-column
            label="播放量"
            prop="playCount"
        />
        <el-table-column
            label="操作"
            width="75"
        >
          <template #default="scope">
            <el-button type="primary" text @click="playSong(scope.row.id)">
              <el-icon><CaretRight /></el-icon>
            </el-button>

          </template>
        </el-table-column>
      </el-table>

    </div>

  </el-scrollbar>
</template>

<style scoped>
:deep(.el-carousel__item.is-active) {
  transform: scale(1.08);
  z-index: 2;
}
/* 调整轮播图高度 */
.el-carousel {
  height: 300px !important;
}

/* 图片悬浮效果 */
.el-carousel-item img {
  transition: transform 0.3s ease;
}
.el-carousel-item:hover img {
  transform: scale(1.05);
}
</style>
