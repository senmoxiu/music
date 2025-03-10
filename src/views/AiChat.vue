<template>
  <!-- 保持原有模板结构不变 -->
  <div class="flex flex-col h-screen max-w-screen-md mx-auto bg-gray-50">
    <!-- 消息展示区域 -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <!-- 消息循环展示 -->
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="[
          'flex',
          msg.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[70%] p-3 rounded-lg',
            msg.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 shadow'
          ]"
        >
          {{ msg.content }}
        </div>
      </div>

      <!-- 加载状态指示 -->
      <div
        v-if="isLoading"
        class="text-center text-gray-500 py-2"
      >
        AI正在思考中...
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="p-4 border-t bg-white">
      <div class="flex gap-2">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          placeholder="输入你的消息..."
          :disabled="isLoading"
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          @click="sendMessage"
          :disabled="!inputMessage || isLoading"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ isLoading ? '发送中...' : '发送' }}
        </button>
      </div>

      <!-- 错误提示 -->
      <div
        v-if="error"
        class="mt-2 text-red-600 text-sm"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

import {ai} from "@/api/api.ts";
import axios from "axios";

// 类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
}



// 响应式数据
const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const error = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

// 发送消息逻辑
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  try {
    isLoading.value = true;
    error.value = '';

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: inputMessage.value
    });

    // 发送请求
    const requestBody = { context: inputMessage.value };
    const response = await ai(requestBody);

    // 打印调试信息
    console.log('API Response:', response);

    // 校验 HTTP 状态码
    if (response.status !== 200) {
      error.value = `请求失败：HTTP 状态码 ${response.status}`;
      console.error('Unexpected HTTP status:', response.status, response.statusText);
      return;
    }

    // 校验响应数据
    if (!response.data || !Array.isArray(response.data.choices) || response.data.choices.length === 0) {
      error.value = 'AI 响应数据异常，请稍后重试。';
      console.error('Unexpected API response:', response.data);
      return;
    }

    // 处理 AI 响应
    messages.value.push({
      role: 'assistant',
      content: response.data.choices[0].message.content
    });

    inputMessage.value = '';
    scrollToBottom();
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      error.value = `请求失败：${
          (axiosError.response?.data as any)?.message || '网络错误'
      }`;
      console.error('API请求错误:', axiosError);
    } else {
      error.value = '发生未知错误，请稍后重试。';
      console.error('Unexpected error:', err);
    }
  } finally {
    isLoading.value = false;
  }
};
// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};
</script>
