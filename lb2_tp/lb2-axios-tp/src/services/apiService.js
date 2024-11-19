import axios from 'axios';

const API_URL = 'http://localhost:3000/api/items';  // Cambia la URL según tu backend

export const getItems = () => axios.get(API_URL);
export const createItem = (data) => axios.post(API_URL, data);
export const updateItem = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteItem = (id) => axios.delete(`${API_URL}/${id}`);
