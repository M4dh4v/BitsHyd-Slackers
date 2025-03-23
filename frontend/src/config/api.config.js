// api.config.js

const API_BASE_URL = `http://192.168.136.97:5000`;
const SOCKET_URL = `http://192.168.136.97:5000`;
const PORT_BACK = Number(import.meta.env.PORT_BACK) || 5000;
const PORT_FRONT = Number(import.meta.env.PORT_FRONT) || 5173;

export { API_BASE_URL, SOCKET_URL, PORT_BACK, PORT_FRONT };
