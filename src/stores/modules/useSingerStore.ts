import type {SingerModel} from "../interface.ts";

export const useSingerStore = defineStore('singer', () => {
    const singer = ref(
        <SingerModel>{
            id: 0,
            name: '',
            pic: '',
            introduction: '',
            sex: 0,
        })
    return {
        singer
    }
})
