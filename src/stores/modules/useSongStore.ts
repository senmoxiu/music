import type {SongModel} from "../interface.ts";

export const useSongStore = defineStore('song', () => {
    const song = ref(
        <SongModel>{
        id: 0,
        singerId: '',
        name: '',
        introduction: '',
        pic: '',
        lyric: '',
        music: '',
        playCount : 0,
        style: ''
    })
    return {
        song
    }
})
