import axios from 'axios';

// This file is ONLY for the connection settings
const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
