<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { CaretRight } from '@element-plus/icons-vue'
import { getSongOfId, getPlaylists, getSongs} from '@/api/api.ts'
import {useSongListStore} from "@/stores/modules/useSongListStore.ts";
import router from "@/router"; // 需要新增这两个API

const route = useRoute()
const activeTab = ref('songs')
const loading = ref(false)

// 搜索参数
const searchParams = ref({
  keywords: '',
  type: 1, // 1-歌曲 1000-歌单
  page: 1,
  pageSize: 10
})

// 分页数据
const pagination = ref({
  total: 0,
  pageSize: 10,
  currentPage: 1
})

// 搜索结果
const songResults = ref<any[]>([])
const playlistResults = ref<any[]>([])

// 执行搜索
const performSearch = async () => {
  try {
    loading.value = true
    const params = {
      title:searchParams.value.keywords,
      name: searchParams.value.keywords,
      page: searchParams.value.page,
      pageSize: searchParams.value.pageSize
    }

    if (activeTab.value === 'songs') {
      const res = await getSongs(params)
      songResults.value = res.data.records
      pagination.value.total = res.data.total
    } else {
      const res = await getPlaylists(params)
      playlistResults.value = res.data.records
      pagination.value.total = res.data.total
    }
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听路由变化
watchEffect(() => {
  searchParams.value.keywords = route.query.keywords as string || ''
  performSearch()
})

// 分页变化
const handlePageChange = (newPage: number) => {
  searchParams.value.page = newPage
  performSearch()
}

// 播放歌曲（复用Main.vue的逻辑）
const playSong = async (id: number) => {
  const songList = useSongListStore()
  const res = await getSongOfId(id)
  await songList.addToPlaylist(res.data)
}

const handleCardClick = (playlistId: number) => {
  router.push({
    name: 'Playlist',
    params: { id: playlistId }
  });
};
</script>

<template>
  <el-scrollbar v-loading="loading">
    <div class="p-6">
      <!-- 标签页 -->
      <el-tabs v-model="activeTab" @tab-change="performSearch">
        <el-tab-pane label="歌曲" name="songs">
          <!-- 歌曲表格 -->
          <el-table :data="songResults" class="w-full" empty-text="暂无搜索结果">
            <el-table-column label="#" width="50">
              <template #default="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column label="封面">
              <template #default="scope">
                <el-image :src="scope.row.pic" class="w-12.5"/>
              </template>
            </el-table-column>
            <el-table-column label="标题" prop="name"/>
            <el-table-column label="歌手" prop="singerName"/>
            <el-table-column label="操作" width="75">
              <template #default="scope">
                <el-button type="primary" text @click="playSong(scope.row.id)">
                  <el-icon><CaretRight /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="歌单" name="playlists">
          <!-- 歌单卡片 -->
          <el-row class="grid grid-cols-12 gap-5">
            <el-col
              v-for="playlist in playlistResults"
              :key="playlist.id"
              :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
            >
              <el-card
                shadow="hover"
                class="group relative overflow-hidden transition-all duration-500 hover:shadow-xl border-0"
                @click="handleCardClick(playlist.id)"
              >
                <img
                  :src="playlist.pic"
                  class="w-full aspect-square object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div class="px-3 pb-2 pt-1 space-y-1">
                  <h3 class="text-base font-semibold text-gray-800 line-clamp-1">{{ playlist.title }}</h3>
                  <p class="text-sm text-gray-500 line-clamp-2">{{ playlist.introduction }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>

      <!-- 分页 -->
      <div class="mt-6 flex justify-center">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          layout="prev, pager, next"
          :total="pagination.total"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </el-scrollbar>
</template>

<style scoped>
/* 保持与现有组件一致的卡片悬停效果 */
.el-card:hover::before {
  opacity: 0.3;
}

/* 统一表格样式 */
:deep(.el-table) {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f8fafc;
}

/* 分页样式 */
:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
}
</style>
