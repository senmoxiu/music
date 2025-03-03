import type {UserState} from "../interface.ts";

export const useUserStore = defineStore('user', () => {

    const user = ref(<UserState>{
        userInfo: {}, loginStatus: false
    })

    function resetUser() {
        user.value = {
            userInfo: {
                id: 0,
                birth: '',
                username: '',
                password: '',
                sex: 0,
                phoneNum: '',
                email: '',
                introduction: '',
                location: '',
                avatar: '',
                createTime: '',
                status: 0
            }, loginStatus: false
        }
    }

    return {
        user, resetUser
    }

}, {
    persist: {
        key: 'user-store', storage: localStorage,
    }
})
