import axios from 'axios'
import { message } from 'ant-design-vue'

axios.defaults.timeout = 60000;

// 请求拦截器
axios.interceptors.request.use(
    config => {
        // console.log('请求拦截')
        return config;
    })

// 响应拦截器
axios.interceptors.response.use(
    response => {
        if (response.status === 200){
            if (response.data.code == "00000") {
                message.error("登录状态已超时，请重新登录");
                return Promise.resolve(response.data)
              } 
            // console.log('请响应拦截器求拦截')
            return response
        } else {
            
            return Promise.reject(response);
        }
});
