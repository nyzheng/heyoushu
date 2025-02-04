const { ref, reactive } = Vue;

export const Version = ref("?v=0.0.4");

export const WebApi = axios.create({
    responseType: "json",
    headers: { "Content-Type": "application/json" },
    baseURL: "https://localhost:7144/api/"
    //baseURL: "https://pharmhoyosu.com.tw/api/"
}); 