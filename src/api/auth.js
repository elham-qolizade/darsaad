// src/api/auth.js
import axios from "axios";

const API_BASE = "https://django-accounting.chbk.app/api";

// ارسال OTP
export const sendOtpRequest = (phone) => {
    return axios.post(`${API_BASE}/auth/send-otp/`, { phone });
  };
  
  export const verifyOtpRequest = async ({ phone, otp_code }) => {
    const res = await axios.post(`${API_BASE}/auth/login/`, { phone, otp_code });
    
    const { access, refresh } = res.data;
  
    if (access) {
      localStorage.setItem("accessToken", access);
    }
    if (refresh) {
      localStorage.setItem("refreshToken", refresh);
    }
  
    return res;
  };