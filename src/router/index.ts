import {createRouter, createWebHistory} from 'vue-router'


const router = createRouter({
    history: createWebHistory(), routes: [{
        path: '/', name: 'home', component: () => import('@/views/Main.vue'),
    }, {
        path: '/hotSongs', name: 'hotSongs', component: () => import('@/views/hot/HotSongs.vue'),
    }, {
        path: '/hotPlaylists', name: 'hotPlaylists', component: () => import('@/views/hot/HotPlaylists.vue'),
    }, {
        path: '/uploadMusic', name: 'uploadMusic', component: () => import('@/views/upload/UploadMusic.vue')
    }, {
        path: '/uploadPlaylist', name: 'uploadPlaylist', component: () => import('@/views/upload/UploadPlaylist.vue')
    },{
        path:'/uploadSinger',name:'uploadSinger',component:()=>import('@/views/upload/UploadSinger.vue')
    }

    ]
})
export default router
