<script lang="ts" setup>

</script>

<template>
  <!-- 使用 h-screen 确保根容器占满屏幕高度 -->
  <el-container class="h-screen flex flex-col">  <!-- 添加 flex-col -->
    <el-header class="border-b border-gray-200 h-[60px]">  <!-- 固定高度 -->
      <Header/>
    </el-header>

    <!-- 主内容区使用 flex-1 占满剩余高度 -->
    <el-container class="flex-1 min-h-0">  <!-- 关键：min-h-0 防止溢出 -->
      <!-- 侧边栏设置 height: 100% 继承父高度 -->
      <el-aside class="border-r border-gray-200 w-auto !h-full">  <!-- 重点 -->
        <Aside/>
      </el-aside>

      <el-main class="p-0">  <!-- 移除默认 padding -->
        <router-view/>
      </el-main>

    </el-container>

    <el-footer class="border-t border-gray-200 h-[50px] px-0">  <!-- 固定高度 -->
      <Footer/>
    </el-footer>
  </el-container>
</template>

<style scoped>

/* 缩小aplayer */
:deep(.aplayer) {
  height: 50px !important;
}

:deep(.aplayer-pic) {
  width: 50px !important;
  height: 50px !important;
}

</style>
