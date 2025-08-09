import axios from "axios";

export async function fetchUnits(token) {
  if (!token) return [];
  try {
    const res = await axios.get("https://django-accounting.chbk.app/api/units/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.results;
  } catch (err) {
    console.error("خطا در دریافت واحدها:", err);
    return [];
  }
}
