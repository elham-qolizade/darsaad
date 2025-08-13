import React, { useState, useEffect } from "react";
import Sidebar from "../Component/Sidebar";
import EditCategoryModal from "../Component/EditCategoryModal";
import CategoryCard from "../Component/CategoryCard";
import Masonry from "react-masonry-css";
import AddCategoryModal from "../Component/AddCategoryModal"
import {
  fetchCategoriesAPI,
  fetchStockListAPI,
  addCategoryAPI, 
  updateCategoryAPI,

} from "../api/categoryApi";


export default function CategoryListPage({ token }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [openCards, setOpenCards] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);

  const firstColumnCats = categories.filter((_, i) => i % 2 === 0);
  const secondColumnCats = categories.filter((_, i) => i % 2 === 1);

  const toggleCard = (id) => {
    setOpenCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedCategory(null);
    setEditModalOpen(false);
  };

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  const fetchCategories = async (url) => {
    setLoading(true);
    try {
      const data = await fetchCategoriesAPI(token, url);
      const categoriesArray = data.results || [];

      const categoriesWithProducts = await Promise.all(
        categoriesArray.map(async (cat) => {
          try {
            const productsData = await fetchStockListAPI(token, cat.id);
            const filteredProducts = (productsData.results || []).filter((product) =>
              product.categories.some((c) => c.id === cat.id)
            );
            return {
              ...cat,
              productCount: productsData.count || filteredProducts.length,
              items: filteredProducts.map((p) => p.title || "بدون نام"),
            };
          } catch (err) {
            console.warn(`خطا در دریافت محصولات دسته ${cat.id}`, err);
            return {
              ...cat,
              productCount: 0,
              items: [],
            };
          }
        })
      );

      setCategories(categoriesWithProducts);
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (updatedData) => {
    try {
      const updatedCategory = await updateCategoryAPI(token, selectedCategory.id, updatedData);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === updatedCategory.id ? { ...cat, ...updatedCategory } : cat))
      );
      closeEditModal();
    } catch (err) {
      console.error("خطا در ذخیره دسته:", err);
    }
  };

  const handleAddCategory = async (newCategoryData) => {
    try {
      const addedCategory = await addCategoryAPI(token, newCategoryData);
      setCategories((prev) => [addedCategory, ...prev]);
      setTotalCount((prev) => prev + 1);
      closeAddModal();
    } catch (err) {
      console.error("خطا در افزودن دسته‌بندی:", err);
      throw err; // برای نمایش خطا در مودال
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  if (loading) return <div className="text-center mt-10">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen relative bg-gray-100 flex flex-col rtl text-right sm:flex-row">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center sm:items-end sm:justify-start">
        <div className="flex flex-col items-end mb-6">
          <h2 className="text-xl font-bold">لیست دسته‌بندی‌ها</h2>
          <button
            onClick={openAddModal}
            className="mt-3 px-3 py-1.5 gap-1 flex rounded bg-custom-blue text-white hover:bg-green-600 transition"
          >
              <span className="text-center">دسته بندی جدید</span>
             <span className="text-base font-semibold">+</span>
          </button>
          <p className="text-gray-600 text-sm mt-1">تعداد کل دسته‌بندی‌ها: {totalCount}</p>
        </div>

        <div dir="rtl" className="w-full flex-col max-w-screen-2xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <Masonry breakpointCols={{ default: 1, 768: 1, 1024: 1 }} columnClassName="space-y-4">
                {firstColumnCats.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isOpen={!!openCards[cat.id]}
                    toggleOpen={() => toggleCard(cat.id)}
                    onEdit={openEditModal}
                    token={token}
                  />
                ))}
              </Masonry>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-col gap-4">
              <Masonry breakpointCols={{ default: 1, 768: 1, 1024: 1 }} columnClassName="space-y-4">
                {secondColumnCats.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isOpen={!!openCards[cat.id]}
                    toggleOpen={() => toggleCard(cat.id)}
                    onEdit={openEditModal}
                    token={token}
                  />
                ))}
              </Masonry>
            </div>
          </div>
        </div>

        {editModalOpen && selectedCategory && (
          <EditCategoryModal
            category={selectedCategory}
            token={token}
            onClose={closeEditModal}
            onSave={handleSaveCategory}
          />
        )}

        {addModalOpen && (
          <AddCategoryModal token={token} onClose={closeAddModal} onSave={handleAddCategory} />
        )}
      </main>
    </div>
  );
}
