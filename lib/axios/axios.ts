'use client'
import axios from 'axios';
import { extractAIResponseFromText } from '../utils';
import { logoutAction } from '../cookies';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
    try {
        const root = localStorage.getItem('persist:root');
        if (root) {
            const user = JSON.parse(root)?.auth;

            const token = JSON.parse(user)?.token;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                throw Error("Error parsing")
            }
        }
    }
    catch (err) {
        handleTokenExpiration();
        console.error("Error accessing localStorage or parsing token:", err);
        throw Error("Error Accessing Storge");
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log("Token expired");
            handleTokenExpiration();
        }
        return Promise.reject(error);
    }
);


const handleTokenExpiration = () => {
    try {
        localStorage.removeItem('persist:root');
        logoutAction();
        console.log("Token removed successfully");
    } catch (e) {
        console.log("Error Removing Token. reason", e);
    } finally {

    }
};

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
    , // Replace with your API URL
    headers: {
        'Content-Type': 'application/json',
    },
});

async function aiBOT(message: string) {
    try {
        const response = await axios.post(process.env.NEXT_PUBLIC_BOT_API_URL || "", {
            model: "deepseek-chat",
            messages: [
                {
                    role: "user",
                    content: message,
                },
            ],
        },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_BOT_TOKEN}`,
                },
            }
        );

        const content = response.data.choices[0].message.content;

        try {
            const response = extractAIResponseFromText(content); // Convert stringified JSON to JS object
            console.log("AI BOT response:", response);
            return response;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            throw new Error("Invalid JSON response: " + content);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const msg =
            error?.response?.data?.error?.message ||
            error?.message ||
            "Unknown error from DeepSeek API";
        throw new Error(`DeepSeek API error: ${msg}`);
    }
}

export { api, axiosInstance, aiBOT };