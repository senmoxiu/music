import {get, post} from "./http.ts";

//登录接口
export function login(data: any) {
    return post(`/api/login`, data)
}

//退出接口
export function logout(data: any) {
    return post(`/api/logout`, data)
}

//注册接口
export function register(data: any) {
    return post(`/api/register`, data,)
}

//获取用户id接口
export function getUserId(data: any) {
    return get(`/consumer/consumer/id`, {data})
}

//获取用户信息接口
export function getUserInfo(id: number) {
    return get(`/consumer/consumer/${id}`, {id})
}

//按播放量查询所有歌曲
export function getCountSong() {
    return get(`/song/getPlayCount`, {})
}

//添加歌曲接口
export function addSong(data: any) {
    return post(`/song/add`, data)
}

//播放量添加
export function addPlayCount(id: number) {
    return post(`/song/addPlayCount/${id}`, {})
}
//添加歌单
export function addSongList(data: any) {
    return post(`/songList/add`, data)
}
//添加歌手信息
export function addSinger(data: any) {
    return post(`/singer/add`, data)
}
//id查询歌曲
export function getSongOfId(id: number) {
    return get(`/song/get/${id}`, {id})
}
//新增播放记录
export function addRecentSong(data:any){
    console.log(data);
    return post(`/recent-song/add`,data)
}
//查询用户收藏歌曲
export function getCollectSong(id:number){
    return get(`/collect/detail/${id}`,{id})
}
//查询用户收藏的歌单
export function getCollectSongList(id:number){
    return get(`/collect/playlist/${id}`,{id})
}
//查询用户最近播放的音乐
export function getRecentSong(id:number){
    return get(`/recent-song/recentSongOfUserId/${id}`,{id})
}
//添加收藏歌曲/歌单
export function addCollect(data:any){
    return post(`/collect/add`,data)
}
