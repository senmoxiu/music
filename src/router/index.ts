import {createRouter, createWebHistory} from 'vue-router'


const router = createRouter({
    history: createWebHistory(), routes: [{
        path: '/', name: 'home', component: () => import('@/views/Main.vue'),
    }, {
        path: '/hotSongs', name: 'hotSongs', component: () => import('@/views/HotSongs.vue'),
    }, {
        path: '/hotPlaylists', name: 'hotPlaylists', component: () => import('@/views/HotPlaylists.vue'),
    }, {
        path: '/uploadMusic', name: 'uploadMusic', component: () => import('@/views/upload/UploadMusic.vue')
    }

    ]
})
export default router
