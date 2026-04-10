import axios from "axios"

export const axiosInstance = axios.create({});

const getAuthToken = (): string | null => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
        return null;
    }

    try {
        const parsed = JSON.parse(storedToken);
        return typeof parsed === "string" ? parsed : storedToken;
    } catch {
        return storedToken;
    }
};

// Add a request interceptor to include JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const apiConnector = (method: any, url: any, bodyData: any, headers: { [key: string]: any; } | undefined, params: Object | undefined) => {
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : undefined,
        params: params ? params : undefined,
    });
}