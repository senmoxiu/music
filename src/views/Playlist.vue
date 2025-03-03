<script setup lang="ts">
import { CaretRight, Star } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import {addCollect, getPlaylists, getPlaylistSongs, getSongOfId} from "@/api/api.ts";
import {useSongListStore} from "@/stores/modules/useSongListStore.ts";
import {useUserStore} from "@/stores/modules/useUserStore.ts";

const songList = useSongListStore()
const userStore = useUserStore()
interface Song {
  id: number
  name: string
  singerName: string
  style: string
  playCount: number
  duration: string
  pic: string
}

interface PlaylistDetail {
  id: number
  title: string
  pic: string
  introduction: string
  songs: Song[]
}

const router = useRouter()
const playlistDetail = ref<PlaylistDetail>()
const loading = ref(true)

// 获取歌单详情
const fetchPlaylistDetail = async (id: number) => {
  try {
    const res = await getPlaylists({
      id: id
    })
    if (res.code === 100200) {
      playlistDetail.value = res.data.records[0]
      // 获取歌单歌曲
      const songsRes = await getPlaylistSongs(id)
      playlistDetail.value.songs = songsRes.data
    }
  } catch (error) {
    console.error('数据加载失败:', error)
  } finally {
    loading.value = false
  }
}

// 收藏歌单
const handleCollect = async () => {
  await addCollect({
    createTime: new Date().toISOString(),
    type: 1,
    userId: userStore.user.userInfo.id,
    songListId: playlistDetail.value?.id
  })
  console.log('收藏歌单:', playlistDetail.value?.id)
}

// 播放全部
const playAll = async () => {
  if (playlistDetail.value?.songs) {
    await songList.addSongList(playlistDetail.value.songs)
    console.log('播放全部歌曲')
  }
}

const playSong = async (id: number) => {
  const res = await getSongOfId(id)
  await songList.addToPlaylist(res.data)
  await nextTick()
}

onMounted(() => {
  const id = Number(router.currentRoute.value.params.id)
  fetchPlaylistDetail(id)
})
</script>

<template>
  <div v-loading="loading" class="container mx-auto px-4 py-6">
    <!-- 头部信息 -->
    <div class="flex gap-6 mb-8">
      <div class="flex-shrink-0">
        <img
          :src="playlistDetail?.pic"
          class="w-64 h-64 rounded-lg shadow-lg"
          alt="歌单封面"
        />
      </div>
      <div class="flex flex-col justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-4">{{ playlistDetail?.title }}</h1>
          <p class="text-gray-600 leading-relaxed max-w-2xl">
            {{ playlistDetail?.introduction }}
          </p>
        </div>
        <div class="flex gap-4">
          <el-button
            type="primary"
            size="large"
            @click="playAll"
          >
            <el-icon class="mr-2"><CaretRight /></el-icon>
            播放全部
          </el-button>
          <el-button
            type="info"
            size="large"
            @click="handleCollect"
          >
            <el-icon class="mr-2"><Star /></el-icon>
            收藏歌单
          </el-button>
        </div>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <el-card shadow="never" class="!border-0">
      <el-table :data="playlistDetail?.songs" stripe>
        <el-table-column label="#" width="50">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="封面" prop="pic">
          <template #default="scope">
            <img :src="scope.row.pic" alt="歌曲封面" class="w-12 h-12 rounded-lg">
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="name" />
        <el-table-column label="歌手" prop="singerName" />
        <el-table-column label="风格" prop="style" />
        <el-table-column label="播放量" prop="playCount" />
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button type="primary" text @click="playSong(scope.row.id)">
              <el-icon><CaretRight /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
.el-card {
  --el-card-padding: 0;
}
</style>
