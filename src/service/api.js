import axios from "axios";

const api = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(config => {
    // 添加认证token（如果需要的话）
    // config.headers.Authorization = 'Bearer fake-token';
    console.log('API请求:', config.method.toUpperCase(), config.url);
    return config;
}, error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
});

api.interceptors.response.use(response => {
    console.log('API响应:', response.status, response.config.url);
    // 注意：这里返回完整的response对象，不是response.data
    return response;
}, error => {
    console.error('响应错误:', error);
    return Promise.reject(error);
});

export default api;