import {post, get} from "./http.ts";

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
