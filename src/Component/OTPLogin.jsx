import React, { useState } from "react";
import { sendOtpRequest, verifyOtpRequest } from "../api/auth";

export default function OTPLogin({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await sendOtpRequest(phone);
      setStep(2);
    } catch (err) {
      setError("خطا در ارسال کد OTP. لطفاً شماره را درست وارد کن.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await verifyOtpRequest({ phone, otp_code: otpCode });
      const token = res.data.access;
      localStorage.setItem("accessToken", token);
      onLogin(token);
    } catch (err) {
      setError("کد OTP اشتباهه یا اعتبارش تموم شده.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black rtl">
      <div className="bg-white p-8 rounded-lg shadow w-80 text-right">
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold mb-4">ورود با شماره موبایل</h2>
            <input
              type="text"
              placeholder="شماره موبایل (مثلاً 0912...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              dir="ltr"
            />
            <button
              onClick={sendOtp}
              disabled={loading || !phone}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {loading ? "در حال ارسال..." : "ارسال کد OTP"}
            </button>
            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-bold mb-4">تایید کد</h2>
            <input
              type="text"
              placeholder="کد OTP دریافتی"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              dir="ltr"
            />
            <button
              onClick={verifyOtp}
              disabled={loading || !otpCode}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              {loading ? "در حال تایید..." : "تایید کد"}
            </button>
            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
