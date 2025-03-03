import axios from 'axios'
// 创建axios实例
const request = axios.create({
    baseURL: 'http://localhost:8088',// 所有的请求地址前缀部分
    timeout: 80000, // 请求超时时间(毫秒)
    withCredentials: true,// 异步请求携带cookie
    headers: {
        // 设置后端需要的传参类型
        // 'Content-Type': 'application/json',
        // 'X-Requested-With': 'XMLHttpRequest',
    },
})

// request拦截器
request.interceptors.request.use(config => {
    // 自动处理 FormData 的 Content-Type
    if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data'
    } else if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
    }
    // 如果你要去localStor获取token,(如果你有)
    let token = localStorage.getItem("satoken");
    if (token) {
        config.headers["satoken"] = token
    } else {
        delete config.headers["satoken"] // 确保无token时不传空值
    }
    return config
}, error => {
    // 对请求错误做些什么
    Promise.reject(error)
})

// response 拦截器
request.interceptors.response.use(response => {
    // 检查是否存在新token（根据sa-token的续期机制）
    const newToken = response.headers['satoken'] || response.data?.token
    if(newToken){
        localStorage.setItem("satoken", newToken)
    }
    return response.data
}, error => {
    // 对响应错误做点什么
    if(error.response?.status === 401){
        localStorage.removeItem("satoken")
        window.location.href = '/login'
    }
    return Promise.reject(error)
})
export default request
