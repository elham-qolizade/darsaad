import React, { useState, useEffect } from "react";
import ProductItem from "./ProductItem";
import { fetchStockListAPI } from "../api/categoryApi"; 
import { convertEnglishNumbersToPersian } from "../utils/numberUtils"; // This can be removed if no Persian needed

const CategoryCard = ({ category, isOpen, toggleOpen, onEdit, token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchStockListAPI(token, category.id);
      setProducts(data.results || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col rounded-xl p-4 shadow-sm border border-gray-200 relative
                  w-full sm:max-w-xs md:max-w-sm lg:max-w-md mx-auto">
      {/* Header */}
      <div
        className="flex flex-row justify-between items-center border-b border-gray-300 pb-3"
        dir="ltr"
      >
        <h3 className="text-center font-semibold text-gray-800 mb-2 sm:mb-0 text-sm sm:text-base md:text-lg">
          {category.english_title || category.title}
        </h3>
        <span className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0 whitespace-nowrap">
          Product count: {isOpen ? products.length : category.productCount}
        </span>

        <div className="flex items-center justify-center gap-2">
          <button
            className="bg-custom-blue text-white text-xs sm:text-sm px-4 py-1 rounded-full whitespace-nowrap"
            onClick={() => onEdit(category)}
          >
            Edit
          </button>
          <button
            onClick={toggleOpen}
            className="text-xl mt-3 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ﹀
          </button>
        </div>
      </div>

      {/* Products List */}
      {isOpen && (
        <div
          className="mt-3 flex bg-gray-50 shadow-inner border border-gray-200 rounded-lg p-3 w-full"
          style={{ maxHeight: "150px", overflowY: "auto" }}
        >
          {loading ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : products.length > 0 ? (
            <ul className="space-y-1 text-xs sm:text-sm text-gray-600 text-left w-full">
              {products.map((item) => (
                <ProductItem key={item.id} title={item.title} />
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No products found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
