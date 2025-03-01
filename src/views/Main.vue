<script lang="ts" setup>
import {getCountSong, getSongOfId} from "@/api/api.ts";
import {useSongListStore} from "@/stores/modules/useSongListStore.ts";
import {CaretRight} from "@element-plus/icons-vue";

const songList = useSongListStore()
let data = ref<any[]>()

onMounted(async () => {
  try {
    const res = await getCountSong()
    data.value = res.data.records
  } catch (error) {
    console.error('歌曲加载失败:', error)
  }
})



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
          v-for="item in 6"
          :key="item"
          class="[&>.el-carousel__mask]:!bg-transparent
               transition-all duration-300 hover:scale-105
               shadow-lg hover:shadow-xl rounded-xl overflow-hidden"
      >
        <div class="h-full flex items-center justify-center
                 bg-gradient-to-br from-pink-200/80 via-purple-200/80 to-blue-200/80
                 backdrop-blur-sm">
          <h3 class="text-6xl font-bold text-white drop-shadow-md">
            {{ item }}
          </h3>
        </div>
      </el-carousel-item>
    </el-carousel>
    <div>
      <el-table :data="data" class="w-auto" height="355">
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

</style>
