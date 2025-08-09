import axios from "axios";

export const fetchCategoriesAPI = async (token, url = "https://django-accounting.chbk.app/api/stock-categories/") => {
  console.log("token:", token);
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

export const fetchStockListAPI = async (token, categoryId) => {
  try {
    const res = await axios.get(
      `https://django-accounting.chbk.app/api/stock/`,
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
      `https://django-accounting.chbk.app/api/stock-categories/${categoryId}/`,
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
