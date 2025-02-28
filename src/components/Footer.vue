<script lang="ts" setup>
//@ts-ignore
import APlayer from "@worstone/vue-aplayer";
import {ArrowLeft, ArrowRight, ArrowUpBold, VideoPause, VideoPlay} from "@element-plus/icons-vue";
import {useSongListStore} from "@/stores/modules/useSongListStore.ts";
import Lyric from 'lyric-parser';
import {ElMessage} from "element-plus";

const songListData = useSongListStore()
const aplayer = ref<{
  skipBack: () => void;
  skipForward: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  audioRef: HTMLAudioElement;
} | null>(null)

const audioList = computed(() => songListData.playerFormatList)

const maxIndex = computed(() => audioList.value.length - 1)


const num = ref(0);

// 使用计算属性保持状态同步
const currentSongTitle = computed(() => {
  // 添加安全访问
  return audioList.value[num.value]?.title || '';
});

const x = ref(true)
const currentSongAuthor = computed(() => {
  // 添加安全访问
  return audioList.value[num.value]?.author || '';
});


const previous = () => {
  // 带边界检查的索引更新
  num.value = num.value <= 0 ? maxIndex.value : num.value - 1;
  // 原子化操作：先更新状态再执行播放器操作
  if (aplayer.value) {
    aplayer.value.skipBack();
  } else {
    console.error('播放器实例未初始化');
  }
};

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
  num.value = num.value >= maxIndex.value ? 0 : num.value + 1;
  if (aplayer.value) {
    // 正确的刷新方式：通过API重新加载播放列表
    aplayer.value.skipForward();
    // 添加延迟确保DOM更新
    nextTick(() => {
      // 强制播放器重新初始化
      aplayer.value?.audioRef.load()
      aplayer.value?.audioRef.play().catch(() => {
      })
    })
  }
};

const handleEnded = () => {
  // 使用next()方法保持切换逻辑统一
  next()
}
// 新增响应式数据
const currentTime = ref(0)
const duration = ref(0)


// 时间格式化方法
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 处理播放进度更新
const handleTimeUpdate = () => {
  if (!aplayer.value?.audioRef) return
  currentTime.value = aplayer.value?.audioRef.currentTime

  if (lyricInstance.value) {
    lyricInstance.value.seek(currentTime.value * 1000)
  }
}

// 处理总时长变化
const handleDurationChange = () => {
  if (!aplayer.value?.audioRef) return
  duration.value = aplayer.value?.audioRef.duration

}

// 处理拖动进度条
const handleSeek = (value: number | number[]) => {
  if (!aplayer.value) return
  // 处理数组类型的情况（范围滑块）
  const seekValue = Array.isArray(value) ? value[0] : value
  aplayer.value.seek(seekValue)
}

//抽屉开关
const lrcData = ref(false)


// 新增响应式数据
const lyricInstance = ref<Lyric | null>(null);
const currentLineNum = ref(0);

// 加载歌词的方法
const loadLyric = async () => {
  try {
    // 清空之前的歌词实例
    if (lyricInstance.value) {
      lyricInstance.value.stop();
      lyricInstance.value = null;
    }

    // 获取当前歌曲的歌词URL（需要确保audioList中有lrc属性）
    const lrcUrl = audioList.value[num.value]?.lrc;
    if (!lrcUrl) return;

    // 获取歌词内容
    const response = await fetch(lrcUrl);
    const lrcText = await response.text();

    // 解析歌词
    lyricInstance.value = new Lyric(lrcText, ({lineNum}) => {
      currentLineNum.value = lineNum;
    });

    // 同步播放器进度
    if (aplayer.value?.audioRef) {
      const currentTime = aplayer.value.audioRef.currentTime;
      lyricInstance.value.seek(currentTime * 1000);

      // 根据播放器实际状态控制歌词
      if (aplayer.value.audioRef.paused) {
        lyricInstance.value.stop();
      } else {
        lyricInstance.value.play(currentTime);
      }
    }
  } catch (error) {
    console.error('歌词加载失败:', error);
    ElMessage.error('歌词加载失败');
  }
};

// 当歌曲切换时重新加载歌词
watch([num, audioList], loadLyric);

// 销毁时清理
onBeforeUnmount(() => {
  lyricInstance.value?.stop();
});

const handlePlay = () => {
  x.value = false;
  lyricInstance.value?.play(aplayer.value?.audioRef.currentTime);
}

const handlePause = () => {
  x.value = true;
  lyricInstance.value?.stop();
}

const scrollToLine = () => {
  nextTick(() => {
    const container = document.querySelector('.el-drawer__body .el-scrollbar__wrap') as HTMLElement
    const activeLine = document.querySelector('.text-primary') as HTMLElement
    if (container && activeLine) {
      const computedStyle = window.getComputedStyle(activeLine)
      const lineHeight = parseInt(computedStyle.lineHeight) +
          parseInt(computedStyle.marginTop) +
          parseInt(computedStyle.marginBottom)
      container.scrollTop = currentLineNum.value * lineHeight - container.offsetHeight / 2
    }
  })
}
// 在watch中新增滚动逻辑
watch(currentLineNum, () => {
  nextTick(() => {
    const container = document.querySelector('.el-drawer__body .el-scrollbar__wrap') as HTMLElement
    const activeLine = document.querySelector('.text-primary') as HTMLElement
    if (container && activeLine) {
      if (container.offsetHeight === 0) {
        setTimeout(() => scrollToLine(), 100) // 延迟重试
        return
      }
      // 计算行元素实际高度
      const computedStyle = window.getComputedStyle(activeLine)
      const lineHeight = parseInt(computedStyle.lineHeight)
          + parseInt(computedStyle.marginTop)
          + parseInt(computedStyle.marginBottom)
      container.scrollTop = currentLineNum.value * lineHeight - container.offsetHeight / 2
    }
  })
})
</script>

<template>
  <div class="h-full flex items-center bg-white border-t border-gray-200 ">
    <APlayer
        ref="aplayer"
        :audio="audioList"
        loop="'none'"
        mode="mini"
        @durationchange="handleDurationChange"
        @ended="handleEnded"
        @pause="handlePause"
        @play="handlePlay"
        @timeupdate="handleTimeUpdate"
    />
    <!-- 歌曲信息 -->
    <div class="flex items-center gap-3 min-w-[200px] px-2">
      <div>
        <div class="font-medium">{{ currentSongTitle }}</div>
        <div class="text-sm text-gray-500">{{ currentSongAuthor }}</div>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="flex items-center gap-2">
      <el-button circle @click="previous">
        <el-icon>
          <ArrowLeft/>
        </el-icon>
      </el-button>

      <el-button circle type="primary" @click="togglePlay">
        <el-icon v-if="!x">
          <VideoPause/>
        </el-icon>
        <el-icon v-else>
          <VideoPlay/>
        </el-icon>
      </el-button>

      <el-button circle @click="next">
        <el-icon>
          <ArrowRight/>
        </el-icon>
      </el-button>
    </div>
    <div class=" px-4 w-full">
      <div class="flex justify-start items-center gap-x-2 truncate text-xs">
        <span class="font-mono tabular-nums">{{ formatTime(currentTime) }}</span>
        <span class="font-mono tabular-nums">/</span>
        <span class="font-mono tabular-nums">{{ formatTime(duration) }}</span>
      </div>
      <el-slider
          v-model="currentTime"
          :format-tooltip="formatTime"
          :max="duration"
          @input="handleSeek"
      />
    </div>
    <div>
      <el-button
          link
          @click="lrcData = true"
      >
        <el-icon>
          <el-icon>
            <ArrowUpBold/>
          </el-icon>
        </el-icon>
      </el-button>
    </div>
  </div>
  <!-- 抽屉组件，用于显示歌词 -->
  <div>
    <el-drawer
        v-model="lrcData"
        :direction="'btt'"
        class="!bg-gradient-to-t from-gray-400 to-gray-50"
        size="100%"
    >
      <template #default>
        <el-scrollbar
            ref="scrollbarRef"
            always
            class="!scrollbar-hide"
        >
          <div class="lyric-container h-full text-center py-2">
            <div
                v-if="lyricInstance"
                :style="{ paddingTop: `calc(20vh - ${currentLineNum} * 4rem - 0.5rem)` }"
                class="lyric-content space-y-4"
            >
              <div
                  v-for="(line, index) in lyricInstance.lines"
                  :key="index"
                  :class="{
                    'text-3xl font-bold text-primary': currentLineNum === index,
                    'text-gray-600': currentLineNum !== index
                  }"
                  class="text-xl transition-all duration-300"
              >
                {{ line.txt }}
              </div>
            </div>

            <div v-else class="text-gray-500 mt-20">
              暂无歌词
            </div>
          </div>
        </el-scrollbar>
      </template>


      <template #footer>

        <div class="h-full flex flex-col px-2 space-y-1  ">

          <div class="text-center">
            <h2 class="text-xl font-bold">{{ currentSongTitle }}</h2>
            <p class="text-gray-500">{{ currentSongAuthor }}</p>
          </div>

          <div class="flex-1 flex flex-col justify-center">
            <div class="space-y-0">
              <div class="flex justify-between text-sm">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
              <el-slider
                  v-model="currentTime"
                  :format-tooltip="formatTime"
                  :max="duration"
                  @input="handleSeek"
              />
            </div>
          </div>
          <!-- 控制按钮（复用相同方法） -->
          <div class="flex justify-center items-center gap-4">
            <el-button circle @click="previous">
              <el-icon>
                <ArrowLeft/>
              </el-icon>
            </el-button>

            <el-button circle size="large" type="primary" @click="togglePlay">
              <el-icon v-if="!x">
                <VideoPause/>
              </el-icon>
              <el-icon v-else>
                <VideoPlay/>
              </el-icon>
            </el-button>

            <el-button circle @click="next">
              <el-icon>
                <ArrowRight/>
              </el-icon>
            </el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>


</template>

<style scoped>
.lyric-container {
  height: 70vh;
  /* 移除 overflow-y: auto */
}

.lyric-content {
  padding: 20vh 0;
  transition: padding-top 0.5s ease-in-out;
  min-height: calc(100% - 40vh); /* 动态高度适应 */
}

</style>
