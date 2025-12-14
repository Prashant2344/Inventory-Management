import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Pointing to Backend
    withCredentials: true, // For Sanctum cookie-based auth if needed, or headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor to add token if we switch to token-based later
// api.interceptors.request.use(config => { ... });

export default api;
