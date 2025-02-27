
import request from "./index.ts";



// 删除所有方法中的 .then/.catch（由拦截器统一处理）
export function get(url: string, params: any) {
    return request.get(url, { params })
}

export function post(url: string, data: any) {
    return request.post(url, data)
}

export function put(url: string, data: any) {
    return request.put(url, data)
}

export function deleteRequest(url: string, params: any) {
    return request.delete(url, { params })
}
