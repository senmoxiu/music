<script lang="ts" setup>
//@ts-ignore
import APlayer from "@worstone/vue-aplayer";
import {ArrowLeft, ArrowRight, ArrowUpBold, Star, StarFilled, VideoPause, VideoPlay} from "@element-plus/icons-vue";
import {useSongListStore} from "@/stores/modules/useSongListStore.ts";
import Lyric from 'lyric-resolver';
import {ElMessage} from "element-plus";
import {useUserStore} from "@/stores/modules/useUserStore.ts";
import {addCollect, addPlayCount, addRecentSong, getCollectSong, getCountSong} from "@/api/api.ts";

// 查询用户登录状态
const userStore = useUserStore()
// 歌曲列表状态管理
const songListData = useSongListStore()

/**
 * 播放器实例引用，包含播放器控制方法和音频元素引用
 */
const aplayer = ref<{
  skipBack: () => void;
  skipForward: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  audioRef: HTMLAudioElement;
  clearList: () => void;
  switchList: (theme: string) => void;
  addList: (list: any) => void;
} | null>(null)

/**
 * 计算属性：格式化后的播放列表数据
 */
const audioList = computed(() => songListData.playerFormatList)

/**
 * 计算属性：播放列表最大索引值
 */
const maxIndex = computed(() => audioList.value.length - 1)

// 当前播放曲目索引
const num = ref(0);

/**
 * 计算当前歌曲标题，处理空值情况
 */
const currentSongTitle = computed(() => {
  return audioList.value[num.value]?.title || '';
});

// 播放状态标志
const x = ref(true)

/**
 * 计算当前歌曲作者，处理空值情况
 */
const currentSongAuthor = computed(() => {
  return audioList.value[num.value]?.author || '';
});


/**
 * 切换到上一首歌曲
 * 实现循环播放逻辑，处理索引边界情况
 */
const previous = () => {
  num.value = num.value <= 0 ? maxIndex.value : num.value - 1;
  if (aplayer.value) {
    aplayer.value.skipBack();
  } else {
    console.error('播放器实例未初始化');
  }
};

/**
 * 切换播放/暂停状态
 */
const togglePlay = () => {
  if (aplayer.value) {
    aplayer.value.toggle();
  } else {
    console.error('播放器实例未初始化');
  }
};

/**
 * 切换到下一首歌曲
 * 实现循环播放逻辑，处理索引边界情况
 * 强制重新加载音频源确保播放列表更新
 */
const next = () => {
  num.value = num.value >= maxIndex.value ? 0 : num.value + 1;
  if (aplayer.value) {
    aplayer.value.skipForward();
    nextTick(() => {
      aplayer.value?.audioRef.load()
      aplayer.value?.audioRef.play().catch(() => {
      })
    })
  }
};
/**
 * 处理播放量更新事件
 * */
const handleVolumeChange = () => {
  if (userStore.user.loginStatus) {
    addPlayCount(audioList.value[num.value].rawData.id)
  }
}

/**
 * 记录播放历史
 * */
const handleRecordRecent = async () => {
  if (!userStore.user.loginStatus) return

  try {
    await addRecentSong({
      songId: audioList.value[num.value].rawData.id,
      userId: userStore.user.userInfo.id,
      updateTime: new Date().toISOString(),
      createTime: new Date().toISOString()
    })
  } catch (error) {
    console.error('记录播放历史失败:', error)
    ElMessage.error('播放记录保存失败')
  }
}

/**
 * 处理歌曲播放结束事件
 */
const handleEnded = () => {
  handleRecordRecent()
  handleVolumeChange()
  next()
}

// 当前播放时间和总时长
const currentTime = ref(0)
const duration = ref(0)

/**
 * 时间格式化工具函数
 * @param seconds 总秒数
 * @returns 格式化的分钟:秒数字符串（如 3:45）
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 处理播放时间更新事件
 * 同步歌词显示进度
 */
const handleTimeUpdate = () => {
  if (!aplayer.value?.audioRef) return
  currentTime.value = aplayer.value?.audioRef.currentTime

  if (lyricInstance.value) {
    lyricInstance.value.seek(currentTime.value * 1000)
  }
}

/**
 * 处理总时长变化事件
 */
const handleDurationChange = () => {
  if (!aplayer.value?.audioRef) return
  duration.value = aplayer.value?.audioRef.duration
}

/**
 * 处理进度条拖动事件
 * @param value 目标时间点（秒）或时间范围数组
 */
const handleSeek = (value: number | number[]) => {
  if (!aplayer.value) return
  const seekValue = Array.isArray(value) ? value[0] : value
  aplayer.value.seek(seekValue)
}

// 歌词抽屉显示控制
const lrcData = ref(false)

// 歌词实例和当前歌词行号
const lyricInstance = ref<Lyric | null>(null);
const currentLineNum = ref(0);

/**
 * 加载歌词数据
 * 实现歌词获取、解析和同步播放状态
 * 处理网络错误和异常情况
 */
const loadLyric = async () => {
  try {
    if (lyricInstance.value) {
      lyricInstance.value.stop();
      lyricInstance.value = null;
    }

    const lrcUrl = audioList.value[num.value]?.lrc;
    if (!lrcUrl) return;

    const response = await fetch(lrcUrl);
    const lrcText = await response.text();

    lyricInstance.value = new Lyric(lrcText, ({curLineNum}) => {
      currentLineNum.value = curLineNum;
    });

    if (aplayer.value?.audioRef) {
      const currentTime = aplayer.value.audioRef.currentTime;
      lyricInstance.value.seek(currentTime * 1000);

      if (aplayer.value.audioRef.paused) {
        lyricInstance.value.stop();
      } else {
        lyricInstance.value.play();
      }
    }
  } catch (error) {
    console.error('歌词加载失败:', error);
    ElMessage.error('歌词加载失败');
  }
};

// 监听歌曲变化自动加载歌词
watch([num, audioList],()=>{
  checkCollectionStatus();
  loadLyric()
});

// 组件卸载前清理歌词实例
onBeforeUnmount(() => {
  lyricInstance.value?.stop();
});

/**
 * 处理播放事件
 * 启动歌词滚动
 */
const handlePlay = () => {
  x.value = false;
  lyricInstance.value?.play();
}

/**
 * 处理暂停事件
 * 停止歌词滚动
 */
const handlePause = () => {
  x.value = true;
  lyricInstance.value?.stop();
}

/**
 * 滚动到当前歌词行
 * 处理容器高度未加载的延迟重试逻辑
 */
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
/**
 * 监听当前歌词行变化
 * 自动执行歌词滚动对齐
 */
watch(currentLineNum, () => {
  nextTick(() => {
    const container = document.querySelector('.el-drawer__body .el-scrollbar__wrap') as HTMLElement
    const activeLine = document.querySelector('.text-primary') as HTMLElement
    if (container && activeLine) {
      if (container.offsetHeight === 0) {
        setTimeout(() => scrollToLine(), 100)
        return
      }

      const computedStyle = window.getComputedStyle(activeLine)
      const lineHeight = parseInt(computedStyle.lineHeight)
          + parseInt(computedStyle.marginTop)
          + parseInt(computedStyle.marginBottom)
      container.scrollTop = currentLineNum.value * lineHeight - container.offsetHeight / 2
    }
  })
})

onMounted(async () => {
  try {
    const res = await getCountSong()
    songListData.songList = res.data.records
  } catch (error) {
    console.error('歌曲加载失败:', error)
  }
})


watch(audioList, (newVal) => {
  if (newVal.length > 0 && aplayer.value) {
    nextTick(async () => {
      // 强制更新APlayer内部状态的三步操作
      aplayer.value?.clearList();      // 1.清空旧列表
      aplayer.value?.addList(songListData.playerFormatList);  // 2.添加新列表
      aplayer.value?.switchList("0");    // 3.切换到首曲
      try {
        aplayer.value?.audioRef.load();
        if (aplayer.value?.audioRef.paused) {
          await aplayer.value.audioRef.play();
          x.value = false; // 同步播放状态
        }
      } catch (error) {
        console.log('自动播放被阻止，需要用户交互');
        // 可添加引导用户点击播放按钮的提示
      }
    });
  }
}, { deep: true });
const isCollected = ref(false); // 收藏状态
const handleCollect = async () => {
  const data ={
    createTime: new Date().toISOString(),
    songId: songListData.songList[num.value].id,
    userId: userStore.user.userInfo.id,
    type: 0
  }
  try {
    const res = await addCollect(data);
    isCollected.value = !isCollected.value; // 切换状态
    ElMessage.success(res.msg);
  } catch (error) {
    ElMessage.error(error);
  }
}


const checkCollectionStatus = async () => {
  if (!userStore.user.loginStatus) return;

  try {
    const res = await getCollectSong(userStore.user.userInfo.id);
    isCollected.value = res.data.some((song: any) =>
        song.id === songListData.songList[num.value]?.id
    );
  } catch (error) {
    console.error('收藏状态查询失败:', error);
  }
}
</script>

<template>
  <!-- 主容器：全高布局，包含播放器控件和歌词抽屉 -->
  <div class="h-full flex items-center bg-white border-t border-gray-200 ">
    <!-- APlayer 音频播放器组件
         :audio - 音频资源列表
         mode - 迷你播放模式
         @事件 - 绑定多个播放状态事件 -->
    <APlayer
        ref="aplayer"
        :audio="audioList"
        :mutex="true"

        loop="'none'"
        mode="mini"
        @durationchange="handleDurationChange"
        @ended="handleEnded"
        @pause="handlePause"
        @play="handlePlay"
        @timeupdate="handleTimeUpdate"
    />

    <!-- 当前歌曲信息展示区 -->
    <div class="flex items-center gap-3 min-w-[200px] px-2">
      <div>
        <div class="font-medium">{{ currentSongTitle }}</div>
        <div class="text-sm text-gray-500">{{ currentSongAuthor }}</div>
      </div>
    </div>

    <!-- 播放控制按钮组 -->
    <div class="flex items-center gap-2">
      <el-button circle @click="previous">
        <el-icon>
          <ArrowLeft/>
        </el-icon>
      </el-button>

      <!-- 播放/暂停切换按钮
           x 表示播放状态 -->
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

    <!-- 播放进度控制组件 -->
    <div class=" px-4 w-full">
      <div class="flex justify-start items-center gap-x-2 truncate text-xs">
        <span class="font-mono tabular-nums">{{ formatTime(currentTime) }}</span>
        <span class="font-mono tabular-nums">/</span>
        <span class="font-mono tabular-nums">{{ formatTime(duration) }}</span>
      </div>
      <!-- 进度条组件
           @input - 处理用户拖动进度事件 -->
      <el-slider
          v-model="currentTime"
          :format-tooltip="formatTime"
          :max="duration"
          @input="handleSeek"
      />
    </div>
<!--收藏按钮-->
    <div>
      <el-button link @click="handleCollect" :disabled="!userStore.user.loginStatus">
        <el-icon :class="{ '!text-yellow-400': isCollected }">
          <StarFilled v-if="isCollected" />
          <Star v-else />
        </el-icon>
      </el-button>
    </div>
    <!-- 歌词展开按钮 -->
    <div>

      <el-button link @click="lrcData = true">
        <el-icon>
          <ArrowUpBold/>
        </el-icon>
      </el-button>
    </div>
  </div>

  <!-- 歌词抽屉组件 -->
  <div>
    <!-- 底部弹出的歌词面板
         :direction - 从底部弹出
         class - 渐变背景样式 -->
    <el-drawer
        v-model="lrcData"
        :direction="'btt'"
        class="!bg-gradient-to-t from-gray-400 to-gray-50"
        size="100%"
    >
      <template #default>
        <!-- 歌词滚动容器 -->
        <el-scrollbar ref="scrollbarRef" always class="!scrollbar-hide">
          <div class="lyric-container h-full text-center py-2">
            <!-- 动态歌词内容区
                 :style - 根据当前歌词行号调整位置 -->
            <div
                v-if="lyricInstance"
                :style="{ paddingTop: `calc(20vh - ${currentLineNum} * 4rem - 0.5rem)` }"
                class="lyric-content space-y-4"
            >
              <!-- 歌词行渲染
                   :class - 当前歌词行高亮样式 -->
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

            <!-- 无歌词提示 -->
            <div v-else class="text-gray-500 mt-20">暂无歌词</div>
          </div>
        </el-scrollbar>
      </template>

      <!-- 抽屉底部控制栏 -->
      <template #footer>
        <div class="h-full flex flex-col px-2 space-y-1">
          <!-- 歌曲信息展示 -->
          <div class="text-center">
            <h2 class="text-xl font-bold">{{ currentSongTitle }}</h2>
            <p class="text-gray-500">{{ currentSongAuthor }}</p>
          </div>

          <!-- 播放进度控制（抽屉样式） -->
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

          <!-- 抽屉播放控制按钮 -->
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

<!-- 歌词区域样式
     lyric-container - 固定高度容器
     lyric-content - 动态歌词位置过渡效果 -->
<style scoped>
.lyric-container {
  height: 70vh;
}

.lyric-content {
  padding: 20vh 0;
  transition: padding-top 0.5s ease-in-out;
  min-height: calc(100% - 40vh);
}
/* 添加过渡动画 */
.el-icon {
  transition: color 0.3s ease;
}
</style>
