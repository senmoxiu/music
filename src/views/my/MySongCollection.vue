<script setup lang="ts">
import {CaretRight } from "@element-plus/icons-vue";
import {getCollectSong, getSongOfId} from "@/api/api.ts";
import {useSongListStore} from "@/stores/modules/useSongListStore.ts";
import {useUserStore} from "@/stores/modules/useUserStore.ts";
const songList = useSongListStore()
const userStore = useUserStore()
const playSong = async (id: number) => {
  const res = await getSongOfId(id)
  await songList.addToPlaylist(res.data)
  await nextTick()
}
let data = ref<any[]>()
const userid = userStore.user.userInfo.id
onMounted(async () => {
   const res = await getCollectSong(userid)
   data.value = res.data
})
</script>

<template>


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
</template>
<style scoped>

</style>
