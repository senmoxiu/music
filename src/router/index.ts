import {createRouter, createWebHistory} from 'vue-router'


const router = createRouter({
    history: createWebHistory(), routes: [{
        path: '/', name: 'home', component: () => import('@/views/Main.vue'),
    }, {
        path: '/hotSongs', name: 'hotSongs', component: () => import('@/views/HotSongs.vue'),
    }, {
        path: '/hotPlaylists', name: 'hotPlaylists', component: () => import('@/views/HotPlaylists.vue'),
    }, {
        path: '/songCollection/:id', name: 'songCollection', component: () => import('@/views/SongCollection.vue'),
    }, {
        path: '/playlistCollection/:id',
        name: 'playlistCollection',
        component: () => import('@/views/PlaylistCollection.vue'),
    }

    ]
})
export default router
