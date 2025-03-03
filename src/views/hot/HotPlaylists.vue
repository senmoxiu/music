<script setup lang="ts">
import {useUserStore} from "@/stores/modules/useUserStore.ts";
import {getRecommendPlaylists} from "@/api/api.ts";

interface Playlist {
  id: number;
  title: string;
  pic: string;
  introduction: string;
}

const router = useRouter();
const playlists = ref<Playlist[]>([]);

// 获取推荐歌单
const getRecommendPlay = async (userId: number) => {

    const res = await getRecommendPlaylists(userId);
    console.log(res);
    if (res.code === 100200) {
      playlists.value = res.data;
    }

};

// 点击卡片跳转详情
const handleCardClick = (playlistId: number) => {
  router.push({
    name: 'Playlist',
    params: { id: playlistId }
  });
};

const userStore = useUserStore();

onMounted(() => {
  // 替换为实际用户ID获取逻辑
  const userId = userStore.user.userInfo.id;
  getRecommendPlay(userId);
});
</script>

<template>
  <el-row class="grid grid-cols-12 gap-5">
    <el-col
      v-for="playlist in playlists"
      :key="playlist.id"
      :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
    >
      <el-card
          class="group relative overflow-hidden transition-all duration-500 hover:shadow-xl border-0"
        @click="handleCardClick(playlist.id)"
          shadow="hover"
      >

        <img
            :src="playlist.pic"
            class="w-full aspect-square object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
            alt="歌单封面"
        />
        <div class="px-3 pb-2 pt-1 space-y-1">
          <h3 class="text-base font-semibold text-gray-800 line-clamp-1">{{ playlist.title }}</h3>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>

.card-gradient {
  background: linear-gradient(#ececec, #ffffff);
}

/* 通过修改element-plus原生变量来调整间距 */
.el-card {
  --el-card-padding: 12px;
}
.el-card:hover::before {
  opacity: 0.3;
}
</style>
