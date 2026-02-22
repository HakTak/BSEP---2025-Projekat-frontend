import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Ako backend vrati 401 (što će sada raditi SessionTrackingFilter kad je sesija revoked)
        if (error.response && error.response.status === 401) {
            console.warn("Sesija opozvana ili istekla. Odjavljivanje...");

            // 1. Obriši token
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token"); // Ako ga imaš

            // 2. Preusmeri na login
            // Koristimo window.location da osiguramo potpun reset aplikacije
           /* if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }*/
        }
        return Promise.reject(error);
    }
);

export default api;