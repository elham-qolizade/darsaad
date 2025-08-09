import axios from "axios";

const API_BASE_URL = "https://django-accounting.chbk.app/api";


export async function fetchCategories(token, page = 1) {
  const res = await axios.get(`${API_BASE_URL}/stock-categories/?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}


export async function addProduct(token, payload) {
  const res = await axios.post(`${API_BASE_URL}/stock/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
