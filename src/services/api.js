import axios from 'axios';

const api = axios.create({
    // Zbog proxy-ja u vite.config.js, ovo je dovoljno
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;