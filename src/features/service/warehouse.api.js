import axios from "axios";

const API_BASE_URL = "https://django-bingo.chbk.app/en/api";


export async function fetchCategories(token, page = 1) {
  const res = await axios.get(`${API_BASE_URL}/stock-categories/?page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}


export async function addProduct(token, payload) {
  console.log("Sending payload to API:", payload);
  const res = await axios.post(`${API_BASE_URL}/stock/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Response from API:", res.data);
  return res.data;
}

export const addCategoryAPI = async (token, newCategoryData) => {
  try {
    const res = await axios.post(
      "https://django-bingo.chbk.app/en/api/stock-categories/",
      newCategoryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
  
};
