import React, { useState, useEffect } from "react";
import { fetchWastes } from "../../service/waste.api";

import { useNavigate, useLocation } from "react-router-dom";

export default function WastePage() {
  const [wastes, setWastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const [wasteMode, setWasteMode] = useState(location.pathname === "/waste");

  const handleWasteToggle = (e) => {
    const checked = e.target.checked;
    setWasteMode(checked);
    if (checked) {
      navigate("/waste");
    } else {
      navigate("/warehouse"); // warehouse path
    }
  };

  useEffect(() => {
    const getWastes = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No access token found");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchWastes(token, page, search);
        setWastes(data.results);
        setTotalPages(Math.ceil(data.count / 10));
      } catch (err) {
        setError("Error fetching data");
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
    <div className="min-h-screen bg-gray-100 p-6 text-left" dir="ltr">
    {/* Toggle button between warehouse and waste */}
    <label className="flex items-center gap-2 text-gray-600 font-medium cursor-pointer select-none mb-6">
      Warehouse Waste
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={wasteMode}
          onChange={handleWasteToggle}
        />
        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-custom-blue transition-colors duration-300"></div>
        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform duration-300"></div>
      </div>
      <span className="text-gray-400">Warehouse Purchase</span>
    </label>
  
    <h2 className="text-2xl font-bold text-gray-700 mb-4">
      {/* عنوان یا هر چیزی که لازم باشه */}
    </h2>
  
    <input
      type="text"
      placeholder="Search..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
      className="mb-4 p-2 border rounded w-full max-w-md text-left"
    />
  
    {error && <div className="text-red-500 mb-4">{error}</div>}
  
    {loading ? (
      <div>Loading...</div>
    ) : wastes.length === 0 ? (
      <div>No data found</div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wastes.map((waste) => (
          <div
            key={waste.id}
            className="bg-white p-5 rounded-xl shadow-md flex flex-col gap-4 relative"
          >
            {/* Date */}
            <div className="text-sm text-gray-500 border-b pb-1 text-left">
              <span className="font-semibold">Created at:</span>{" "}
              {new Date(waste.created_at).toLocaleDateString("en-US")}
            </div>
  
            {/* Substances and quantities */}
            {waste.substances && waste.substances.length > 0 && (
              <div className="space-y-2">
                {waste.substances.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between text-gray-600 text-sm items-center"
                  >
                    <div className="font-medium text-left">{s.substance?.title || "No name"}</div>
                    <div className="text-left">
                      <span className="font-semibold">{s.count}</span>{" "}
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
        Previous Page
      </button>
      <span className="text-gray-700">
        Page {page} of {totalPages}
      </span>
  
      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className="px-4 py-1 bg-custom-blue text-white rounded disabled:opacity-50"
      >
        Next Page
      </button>
    </div>
  </div>
  
  );
}
