import React, { useState, useEffect } from "react";
import { fetchWastes } from "../../service/waste.api";
import { convertEnglishNumbersToPersian } from "../../../utils/numberUtils"; // ← اضافه کردن

export default function WastePage() {
  const [wastes, setWastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getWastes = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("توکن ورود پیدا نکرد");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchWastes(token, page, search);
        setWastes(data.results);
        setTotalPages(Math.ceil(data.count / 10));
      } catch (err) {
        setError("خطا در دریافت اطلاعات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getWastes();
  }, [page, search]);

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right" dir="rtl">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">
        لیست دورریز انبار
      </h2>

      <input
        type="text"
        placeholder="جستجو..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : wastes.length === 0 ? (
        <div>داده‌ای پیدا نشد</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wastes.map((waste) => (
            <div
              key={waste.id}
              className="bg-white p-5 rounded-xl shadow-md flex flex-col gap-4 relative"
            >
              {/* تاریخ */}
              <div className="text-sm text-gray-500 border-b pb-1">
                <span className="font-semibold">تاریخ ثبت:</span>{" "}
                {convertEnglishNumbersToPersian(
                  new Date(waste.created_at).toLocaleDateString("fa-IR")
                )}
              </div>

              {/* مواد و مقدار */}
              {waste.substances && waste.substances.length > 0 && (
                <div className="space-y-2">
                  {waste.substances.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between text-gray-600 text-sm items-center"
                    >
                      <div className="font-medium">
                        {s.substance?.title || "بدون نام"}
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          {convertEnglishNumbersToPersian(s.count)}
                        </span>{" "}
                        <span>{s.unit?.name || ""}</span>
                        {s.description?.trim() && (
                          <div className="text-xs text-gray-400 mt-1 italic">
                            ({s.description})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center items-center mt-6 gap-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-1 bg-custom-blue text-white rounded disabled:opacity-50"
        >
          صفحه قبل
        </button>
        <span className="text-gray-700">
          صفحه {convertEnglishNumbersToPersian(page)} از{" "}
          {convertEnglishNumbersToPersian(totalPages)}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-4 py-1 bg-custom-blue text-white rounded disabled:opacity-50"
        >
          صفحه بعد
        </button>
      </div>
    </div>
  );
}
