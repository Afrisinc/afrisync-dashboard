import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

// Use relative URLs in production for runtime proxy, absolute URLs in development
const getBaseURL = () => {
  const isDev = import.meta.env.DEV;

  if (isDev && CONFIG.serverUrl) {
    // Development: use full server URL
    return CONFIG.serverUrl;
  }

  // Production: use relative path (requests will be proxied by nginx)
  return '/api';
};

const axiosInstance = axios.create({ baseURL: getBaseURL() });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

// ----------------------------------------------------------------------

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: { me: '/auth/profile', signIn: '/auth/login', signUp: '/api/auth/sign-up' },
  mail: { list: '/api/mail/list', details: '/api/mail/details', labels: '/api/mail/labels' },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  ai: { generate: '/ai/generate' },
  socialMedia: { userPosts: '/social-media/user/posts' },
};
