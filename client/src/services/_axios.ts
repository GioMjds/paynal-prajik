import axios from "axios";

export const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const ADMIN = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/master`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});