<script setup lang="js">
import APlayer from "@worstone/vue-aplayer";
import {ArrowLeft, ArrowRight, VideoPause, VideoPlay} from "@element-plus/icons-vue";


const aplayer = ref(null)
const audio = ref([
  {
    "title": "烟雨行舟（原唱：伦桑）",
    "author": "司南",
    "url": "https://api.i-meto.com/meting/api?server=netease&type=url&id=1301884692&auth=898d1269a732530c578b63624fe8be0bdfc14205",
    "pic": "https://api.i-meto.com/meting/api?server=netease&type=pic&id=109951167056907210&auth=a4976ca0e04dc7a5592a706e1bd70c93acd1591f",
    "lrc": "https://api.i-meto.com/meting/api?server=netease&type=lrc&id=1301884692&auth=425c4730fe0caf12cf4c0eabacc3398097c8ba49"
  },
  {
    "title": "Legends Never Die",
    "author": "Against the Current",
    "url": "https://api.i-meto.com/meting/api?server=netease&type=url&id=506196018&auth=c5c21102c12896557ecf3fd43a415c050fe757a6",
    "pic": "https://api.i-meto.com/meting/api?server=netease&type=pic&id=109951163918904060&auth=ab3ada1788834c2c30fc14be2320219dbeaebc12",
    "lrc": "https://api.i-meto.com/meting/api?server=netease&type=lrc&id=506196018&auth=9038409d31ec7f40ea7888b77f0839051a2859a5"
  }
])

// 在组合式API中定义
const audioList = audio.value; // 明确音乐列表引用
const maxIndex = audioList.length - 1; // 预计算最大索引

const num = ref(0);

// 使用计算属性保持状态同步
const currentSongTitle = computed(() => {
  // 添加安全访问
  return audioList[num.value]?.title || '';
});

const x = ref(true)

const currentSongAuthor = computed(() => {
  // 添加安全访问
  return audioList[num.value]?.author || '';
});
const togglePlay = () => {
  // 添加空值保护
  if (aplayer.value) {
    aplayer.value.toggle();
  } else {
    console.error('播放器实例未初始化');
  }

};

const next = () => {
  // 带边界检查的索引更新
  num.value = num.value >= maxIndex ? 0 : num.value + 1;

  // 原子化操作：先更新状态再执行播放器操作
  if (aplayer.value) {
    aplayer.value.skipForward();
  } else {
    console.error('播放器实例未初始化');
  }
};


// 新增响应式数据
const currentTime = ref(0)
const duration = ref(0)


// 时间格式化方法
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 处理播放进度更新
const handleTimeUpdate = () => {
  currentTime.value =aplayer.value.audioRef.currentTime
}

// 处理总时长变化
const handleDurationChange = () => {
  duration.value = aplayer.value.audioRef.duration
}

// 处理拖动进度条
const handleSeek = (value) => {
  if (aplayer.value) {
    aplayer.value.seek(value)
  }
}



</script>

<template>
  <div class="h-full flex items-center bg-white border-t border-gray-200 ">
    <APlayer
        ref="aplayer"
        :audio="audio"
        :showLrc="true"
        mode="mini"
        @timeupdate="handleTimeUpdate"
        @durationchange="handleDurationChange"
        @play="x = false"
        @pause="x = true"
        @lyricloaded="handleLyricLoaded"
    />
    <!-- 歌曲信息 -->
    <div class="flex items-center gap-3 min-w-[200px] px-2">
      <div>
        <div class="font-medium">{{ currentSongTitle}}</div>
        <div class="text-sm text-gray-500">{{ currentSongAuthor}}</div>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="flex items-center gap-2">
      <el-button circle @click="previous">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>

      <el-button type="primary" circle @click="togglePlay">
        <el-icon v-if="!x"><VideoPause /></el-icon>
        <el-icon v-else><VideoPlay /></el-icon>
      </el-button>

      <el-button circle @click="next">
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
    <div class=" px-4 w-full">
      <div class="flex justify-between text-sm text-gray-500">
        <span class="font-mono tabular-nums">{{ formatTime(currentTime) }}</span>
        <span class="font-mono tabular-nums">{{}}</span>
        <span class="font-mono tabular-nums">{{ formatTime(duration) }}</span>
      </div>
      <el-slider
          v-model="currentTime"
          :max="duration"
          :format-tooltip="formatTime"
          @input="handleSeek"
      />
    </div>
  </div>

</template>

<style scoped>

</style>
