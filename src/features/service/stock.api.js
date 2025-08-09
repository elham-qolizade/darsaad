import axios from "axios";

const API_BASE_URL = "https://django-accounting.chbk.app/api";


export const fetchStockItems = async (token, page = 1, categoryIds = []) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    categoryIds.forEach(cat => params.append("categories", cat));
    const url = `${API_BASE_URL}/stock/?${params.toString()}`;
    console.log("fetchStockItems URL:", url);
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

export async function postStockPurchase(token, payload) {
  return axios.post(`${API_BASE_URL}/stock-purchases/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function postWaste(token, payload) {
  console.log("Payload for wastage:", JSON.stringify(payload, null, 2));

  return axios.post(`${API_BASE_URL}/wastage/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
}

// اینم فانکشن جدید برای گرفتن واحدها
export async function getUnits(token) {
  const res = await axios.get(`${API_BASE_URL}/units/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

