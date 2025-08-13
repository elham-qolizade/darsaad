import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { fetchStockItems } from "../../service/stock.api";

const PAGE_SIZE = 10;

export default function StockPurchaseItemsList({ selectedCategories, token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const getItems = async () => {
      if (!token) {
        setError("No token found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await fetchStockItems(token, currentPage, selectedCategories);
        setItems(data.results || []);
        setTotalItems(data.count || 0);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    getItems();
  }, [currentPage, selectedCategories, token]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (items.length === 0) return <div>No items found</div>;

  return (
    <div dir="ltr" className="p-4">
    <div dir="ltr" className="space-y-4">
      {items.map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
    <div dir="ltr" className="flex justify-center items-center gap-3 mt-6">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        Prev
      </button>
  
      <span className="text-gray-700 select-none">
        Page {currentPage} of {totalPages}
      </span>
  
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
  
  );
}
