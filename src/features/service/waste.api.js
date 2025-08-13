import axios from "axios";

const API_BASE_URL = "https://django-bingo.chbk.app/en/api";


export async function fetchWastes(token, page = 1, search = "") {
  const params = {
    page,
    search,
    ordering: "created_at",
  };

  const res = await axios.get(`${API_BASE_URL}/wastage/`, {  // آدرس اصلاح شد
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return res.data;
}
// export async function deleteWaste(token, id) {
//   if (!id) throw new Error("آیدی ضایعات لازم است");
  
//   try {
//     const res = await axios.delete(`${API_BASE_URL}/wastage/${id}/`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return res.data;
//   } catch (error) {
//     console.error("خطا در حذف ضایعات:", error.response ? {
//       status: error.response.status,
//       data: error.response.data,
//       headers: error.response.headers,
//     } : error);
//     throw error;
//   }
// }

