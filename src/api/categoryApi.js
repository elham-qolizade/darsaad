import axios from "axios";
const API_BASE_URL = "https://django-bingo.chbk.app/en/api";


export const fetchCategoriesAPI = async (token, url = `${API_BASE_URL}/stock-categories/`) => {
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createCategoryAPI = async (token, newCategoryData) => {
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

export const fetchStockListAPI = async (token, categoryId) => {
  try {
    const res = await axios.get(
      `https://django-bingo.chbk.app/en/api/stock/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          categories: categoryId,  // آرایه هم میتونی بزاری اگه چند تا id داری
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};




export const updateCategoryAPI = async (token, categoryId, updatedData) => {
  try {
    const res = await axios.patch(
      `https://django-bingo.chbk.app/en/api/stock-categories/${categoryId}/`,
      updatedData,
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
// // categoryApi.js
// import axios from "axios";

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
