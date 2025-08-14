import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  //baseURL: '13.211.21.176', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
