import { fileURLToPath, URL } from 'node:url'
// 从node:url模块导入fileURLToPath和URL函数，用于处理文件路径
import { defineConfig } from 'vite'
// 从vite模块导入defineConfig函数，用于定义Vite配置
import vue from '@vitejs/plugin-vue'
// 从@vitejs/plugin-vue模块导入vue插件，用于支持Vue.js开发
import vueDevTools from 'vite-plugin-vue-devtools'
// 从vite-plugin-vue-devtools模块导入vueDevTools插件，用于在开发中启用Vue Devtools
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
// 从vite-plugin-vue-setup-extend模块导入VueSetupExtend插件，用于扩展Vue的setup语法
import AutoImport from 'unplugin-auto-import/vite'
// 从unplugin-auto-import/vite模块导入AutoImport插件，用于自动导入Vue依赖
import Components from 'unplugin-vue-components/vite'
// 从unplugin-vue-components/vite模块导入Components插件，用于自动导入Vue组件
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// 从unplugin-vue-components/resolvers模块导入ElementPlusResolver，用于配置ElementPlus组件自动导入
import IconsResolver from 'unplugin-icons/resolver'
// 从unplugin-icons/resolver模块导入IconsResolver，用于配置Iconify组件自动导入
import Icons from 'unplugin-icons/vite'
// 从unplugin-icons/vite模块导入Icons插件，用于自动导入Iconify组件
import tailwindcss from '@tailwindcss/vite'
// 从tailwindcss模块导入tailwindcss，用于支持Tailwind CSS


// https://vite.dev/config/
// 以上是Vite配置文档的链接
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // 创建一个路径别名'@'，指向项目的src目录
    },
  },
  plugins: [
    vue(), // 使用vue插件
    vueDevTools(), // 使用vueDevTools插件
    VueSetupExtend(), // 使用VueSetupExtend插件
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'], // 自动导入Vue依赖
      dts: './src/auto-imports.d.ts', // 自动导入的类型定义文件路径
      resolvers: [
        ElementPlusResolver(),
        // 配置ElementPlus组件自动导入
        IconsResolver({
          prefix: 'Icon',
        }),],
      // 配置Iconify组件自动导入
    }), // 使用AutoImport插件
    Components({
      dirs: ['src/components'], // 自动导入Vue组件所在目录
      extensions: ['vue'], // 自动导入Vue组件文件扩展名
      dts: './src/components.d.ts', // 自动导入的类型定义文件路径
      resolvers: [
        ElementPlusResolver(),
        // 配置ElementPlus组件自动导入
        IconsResolver({
          enabledCollections: ['ep'],
        }),
      ],
    }), // 使用Components插件
    Icons({
      autoInstall: true,
    }), // 使用Icons插件
    tailwindcss(), // 使用tailwindcss插件

  ],

})
