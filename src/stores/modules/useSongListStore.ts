import type {SongModel} from "../interface.ts";

export const useSongListStore = defineStore('songList', () => {
    const songList = ref<SongModel[]>([])
    // 新增转换后的播放器专用数据
    const playerFormatList = computed(() => {
        return songList.value.map(song => ({
            title: song.name,          // 映射歌曲名称
            author: song.singerName, pic: song.pic,             // 封面字段保持一致
            url: song.music,           // 音乐文件地址
            lrc: song.lyric,           // 歌词文件
            rawData: {...song}

        }));
    });

    const resetSongList = () => {
        songList.value = []
    }

    async function addToPlaylist(song: SongModel){
        songList.value = [song, ...songList.value]
        return songList.value
    }

    async function addSongList(data:any) {
        songList.value = data
        return songList.value
    }

    return {
        songList, playerFormatList, resetSongList, addToPlaylist,addSongList
    }
}, {
    persist: {
        storage: localStorage, key: 'songList-store'
    }

})
