import axios from 'axios';

const api = axios.create({
    // .env faylidan o'qish o'rniga manzil to'g'ridan-to'g'ri yozildi
    baseURL: 'http://127.0.0.1:8000/api', 
});

// Bu qism o'zgarishsiz qoladi, u har bir so'rovga avtorizatsiya tokenini qo'shib beradi
api.interceptors.request.use(config => {
    const token = localStorage.getItem('pos-auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;