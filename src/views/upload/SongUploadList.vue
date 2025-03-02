<template>
  <div class=" h-full bg-gray-50 p-8">
    <el-steps :active="activeStep" class="max-w-3xl mx-auto mb-8" finish-status="success">
      <el-step title="选择歌单"/>
      <el-step title="选择歌曲"/>
      <el-step title="确认添加"/>
    </el-steps>

    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <!-- 步骤1：歌单选择 -->
      <div v-show="activeStep === 0">
        <el-table
          v-loading="playlistLoading"
          :data="playlists"
          @row-click="selectPlaylist"
          highlight-current-row
          height="300px"
          style="width: 100%">
          <el-table-column label="封面" width="100">
            <template #default="{row}">
              <el-image :src="row.pic" class="w-12.5 h-12.5 rounded"/>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="歌单名称"/>
          <el-table-column prop="style" label="类型"/>
        </el-table>
        <el-pagination
            :current-page="playlistPagination.currentPage"
            :page-size="playlistPagination.pageSize"
            :total="playlistPagination.total"
            layout="total, sizes, prev, pager, next"
            @current-change="val => { playlistPagination.currentPage = val; loadPlaylists() }"
            @size-change="val => { playlistPagination.pageSize = val; loadPlaylists() }"
        />
      </div>

      <!-- 步骤2：歌曲选择 -->
      <div v-show="activeStep === 1">
        <el-table
          v-loading="songLoading"
          :data="songs"
          @selection-change="handleSelectionChange"
          height="300px"
          style="width: 100%"
          row-key="id"
          ref="songTable"
        >
          <el-table-column type="selection" width="55" reserve-selection />
          <el-table-column label="封面" width="100">
            <template #default="{row}">
              <el-image :src="row.pic" class="w-12.5 h-12.5 rounded"/>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="歌曲名称"/>
          <el-table-column prop="singerName" label="歌手"/>
          <el-table-column prop="style" label="风格"/>
        </el-table>
        <el-pagination
            :current-page="songPagination.currentPage"
            :page-size="songPagination.pageSize"
            :total="songPagination.total"
            layout="total, sizes, prev, pager, next"
            @current-change="val => { songPagination.currentPage = val; loadSongs() }"
            @size-change="val => { songPagination.pageSize = val; loadSongs() }"
        />
      </div>

      <!-- 步骤3：确认信息 -->
      <div v-show="activeStep === 2" class="confirm-panel">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="目标歌单">{{ selectedPlaylist?.name }}</el-descriptions-item>
          <el-descriptions-item label="已选歌曲">
            <div v-for="song in selectedSongs" :key="song.id" class="py-1">
              {{ song.name }} - {{ song.singerName }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>


      <div class="flex justify-between mt-8">
        <el-button :disabled="activeStep === 0" @click="activeStep--">
          上一步
        </el-button>

        <el-button
          v-if="activeStep < 2"
          type="primary"
          @click="handleNextStep">
          下一步
        </el-button>

        <el-button
          v-else
          :loading="submitting"
          type="success"
          @click="submitAdd">
          确认添加
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getPlaylists, getSongs, addSongsToPlaylist } from '@/api/api'

interface Playlist {
  id: number
  name: string
  pic: string
  songCount: number
  playCount: number
}

interface Song {
  id: number
  name: string
  pic: string
  singerName: string
  style: string
}

const activeStep = ref(0)
const submitting = ref(false)

// 分页相关数据
const playlistPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const songPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 歌单相关数据
const playlists = ref<Playlist[]>([])
const selectedPlaylist = ref<Playlist>()
const playlistLoading = ref(false)

// 歌曲相关数据
const songs = ref<Song[]>([])
const selectedSongs = ref<Song[]>([])
const songLoading = ref(false)

// 修改后的加载歌单方法
const loadPlaylists = async () => {
  playlistLoading.value = true
  try {
    const res = await getPlaylists({
      pageNumber: playlistPagination.value.currentPage,
      pageSize: playlistPagination.value.pageSize
    })
    playlists.value = res.data.records
    playlistPagination.value.total = res.data.total
  } finally {
    playlistLoading.value = false
  }
}

// 修改后的加载歌曲方法
const loadSongs = async () => {
  songLoading.value = true
  try {
    const res = await getSongs({
      pageNumber: songPagination.value.currentPage,
      pageSize: songPagination.value.pageSize
    })
    songs.value = res.data.records
    songPagination.value.total = res.data.total
  } finally {
    songLoading.value = false
  }
  setTimeout(() => {
    selectedSongs.value.forEach(row => {
      songTable.value.toggleRowSelection(row, true)
    })
  })
}

// 步骤切换处理
const handleNextStep = () => {
  if (activeStep.value === 0 && !selectedPlaylist.value) {
    ElMessage.error('请先选择歌单')
    return
  }
  if (activeStep.value === 1 && selectedSongs.value.length === 0) {
    ElMessage.error('请至少选择一首歌曲')
    return
  }
  activeStep.value++
}

// 提交表单
const submitAdd = async () => {
  try {
    submitting.value = true
    await addSongsToPlaylist(
        selectedPlaylist.value.id,
        selectedSongs.value.map(s => s.id)
    )
    ElMessage.success('歌曲添加成功')
    resetForm()
  } catch (error) {
    ElMessage.error('添加失败: ' + error?.message)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  activeStep.value = 0
  selectedPlaylist.value = undefined
  selectedSongs.value = []
  playlistPagination.value = {
    currentPage: 1,
    pageSize: 10,
    total:0}
}

const songTable = ref()

// 初始化加载数据
onMounted(() => {
  loadPlaylists()
  loadSongs()
})

// 表格选择处理
const selectPlaylist = (row: Playlist) => {
  selectedPlaylist.value = row
}

const handleSelectionChange = (val: Song[]) => {
  selectedSongs.value = val
}


</script>

<style scoped>
.confirm-panel {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

.el-table {
  margin-bottom: 20px;
}

/* 统一滚动条样式 */
:deep(.el-table__body-wrapper)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
</style>
