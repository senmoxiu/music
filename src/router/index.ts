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
    },{
        path:'/mySongCollection',name:'mmySongCollection',component:()=>import('@/views/my/MySongCollection.vue')
    },{
        path:'/recentPlay',name:'recentPlay',component:()=>import('@/views/my/RecentPlay.vue')
    },{
        path:'/songUploadList',name:'songUploadList',component:()=>import('@/views/upload/SongUploadList.vue')
    },{
        path:'/playlist/:id', name: 'Playlist', component: () => import('@/views/Playlist.vue'),
    }
    ]
})
export default router
