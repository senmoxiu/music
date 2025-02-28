//用户信息
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
//用户状态
export interface UserState {
    userInfo: UserModel
    loginStatus: boolean
}
//歌曲信息
export interface SongModel {
    id: number;
    singerId: string;
    singerName: string;
    name: string;
    introduction: string;
    pic: string;
    lyric: string;
    music: string;
    playCount : number;
    style: string;
}
//歌手信息
export interface SingerModel {
    id: number;
    name: string;
    introduction: string;
    pic: string;
    sex: number;
}
