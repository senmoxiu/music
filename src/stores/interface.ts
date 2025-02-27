
export interface UserModel {
    id: number;
    username: string;
    password: string;
    sex: number;
    phone: string;
    email: string;
    introduction: string;
    location: string;
    avatar: string;
    createTime: string;
    status: number;
}

export interface UserState {
    userInfo: UserModel
    loginStatus: boolean
}
