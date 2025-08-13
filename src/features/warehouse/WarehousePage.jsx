import React, { useState, useEffect } from "react";

import StockPurchaseItemsList from "./components/StockPurchaseItemsList";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchCategories, addProduct } from "../service/warehouse.api";
import { fetchStockItems } from "../service/stock.api";
import { BsFilterRight } from "react-icons/bs";
import { FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/Sidebar";
import AddProductModal from "./components/AddToWarehouse";
import { fetchUnits } from "../../api/unitApi";

export default function WarehousePage({ token }) {
  const [wasteMode, setWasteMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  // const [selectedCategory, setSelectedCategory] = useState(null);
  const [units, setUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPageStock, setHasNextPageStock] = useState(false);
  const [hasPrevPageStock, setHasPrevPageStock] = useState(false);

  // const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState("");

  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const filteredStockItems = stockItems;

  const [productData, setProductData] = useState({
    title: "",
    unit: "",
    categories: [],
    unit_price: "",
    perishable: false,
    stock_alert_on: "0",
  });
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleAddProduct = async (payload) => {
    try {
      await addProduct(token, payload);
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error("خطا در ثبت محصول:", error);
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    const getCats = async () => {
      setLoadingCategories(true);
      setErrorCategories("");
      try {
        const data = await fetchCategories(token);
        setCategories(data.results || []);
      } catch {
        setErrorCategories("خطا در دریافت دسته‌بندی‌ها");
      } finally {
        setLoadingCategories(false);
      }
    };
    if (token) getCats();
  }, [token]);

  useEffect(() => {
    console.log("useEffect fired with selectedCategories:", selectedCategories);
    async function fetchStock() {
      setLoading(true);
      setError("");
      try {
        console.log("fetchStockItems called with:", selectedCategories);
        const data = await fetchStockItems(token, currentPage, selectedCategories);
        setStockItems(data.results || []);
        setHasNextPageStock(Boolean(data.next));
        setHasPrevPageStock(Boolean(data.previous));
      } catch (error) {
        setError("خطا در دریافت داده‌های انبار");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStock();
  }, [token, currentPage, selectedCategories]);
  
  
  useEffect(() => {
    async function fetchUnits() {
      if (!token) return;
      try {
        const res = await fetch("https://django-accounting.chbk.app/api/units/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnits(data.results || []);
      } catch (err) {
        console.error("خطا در دریافت واحدها:", err);
      }
    }
    fetchUnits();
  }, [token]);
  const toggleCategory = (catId) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId];
      console.log("toggleCategory updated selectedCategories:", newCategories);
      return newCategories;
    });
    setCurrentPage(1); 
  };
  
  useEffect(() => {
    async function loadUnits() {
      setLoadingUnits(true);
      try {
        const data = await fetchUnits(token);
        // فرض می‌گیریم data یه آرایه از واحدهاست
        setUnits(data);
      } catch (e) {
        console.error("خطا در دریافت واحدها:", e);
        setError("خطا در دریافت واحدها");
      } finally {
        setLoadingUnits(false);
      }
    }

    loadUnits();
  }, [token]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      title: productData.title,
      unit: productData.unit,
      categories: productData.categories,
      perishable: productData.perishable,
      stock_alert_on: productData.stock_alert_on,
      unit_price: productData.unit_price,
    };
    try {
      await addProduct(token, payload);
      alert("ماده اولیه با موفقیت ثبت شد!");
      setModalOpen(false);
      setProductData({
        title: "",
        unit: "",
        categories: [],
        unit_price: "",
        perishable: false,
        stock_alert_on: "0",
      });
      setCurrentPage(1);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "خطا در ارسال داده");
    } finally {
      setLoading(false);
    }
  };

  const handleWasteToggle = (e) => {
    const checked = e.target.checked;
    setWasteMode(checked);
    if (checked) {
      navigate("/waste");
    } else {
      navigate("/");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChangeMulti = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setProductData((prev) => ({ ...prev, [e.target.name]: selected }));
  };

  return (
    <div  className="flex flex-col md:flex-row min-h-screen bg-gray-100 text-right">
      <Sidebar />

      <main className="flex-1 justify-center items-center sm:justify-start p-4 md:p-6">
        <div className="flex flex-col items-end gap-4 mb-6">
          <label className="flex items-center gap-2 text-gray-600 font-medium cursor-pointer select-none">
            خرید انبار
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={wasteMode}
                onChange={handleWasteToggle}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue transition-colors duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform duration-300"></div>
            </div>
            <span className="text-gray-400">دور ریز انبار</span>
          </label>

          <div className="flex flex-wrap justify-center items-center gap-2">
            {loadingCategories && <p>در حال بارگذاری دسته‌بندی‌ها...</p>}
            {errorCategories && <p className="text-red-600">{errorCategories}</p>}

            {!loadingCategories &&
              !errorCategories &&
              categories.length > 0 &&
              categories.map((cat) => (
                <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`rounded-md px-4 py-1 text-sm ${
                  selectedCategories.includes(cat.id)
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {cat.title}
              </button>
              
              ))}

            <div className="hidden sm:block w-px h-6 bg-gray-300 mx-2" />

            <div className="hidden sm:flex items-center gap-2">
              <BsFilterRight />
              <p className="font-thin text-sm">فیلتر</p>
              <FaFilter />
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-custom-blue items-center text-white px-3 py-1.5 rounded-md flex justify-center gap-1 text-sm hover:bg-[#0C3565] transition w-full sm:w-auto"
            >
              <span className="text-center">مواد اولیه جدید</span>
              <span className="text-base font-semibold">+</span>
            </button>
          </div>
        </div>

        <div dir="rtl" className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? (
            <p>در حال بارگذاری محصولات...</p>
          ) : filteredStockItems.length === 0 ? (
            <p>محصولی یافت نشد</p>
          ) : (
<StockPurchaseItemsList selectedCategories={selectedCategories} token={token} />




          )}
        </div>

        <AddProductModal
  addProduct={addProduct}
  modalOpen={modalOpen}
  setModalOpen={setModalOpen}
  productData={productData}
  units={units}
  categories={categories}
  loading={loading}
  setLoading={setLoading}
  error={error}
  setError={setError}
  token={token}
  onSubmit={async (data) => {
    console.log("submit clicked", data);

    // چک کن unit داخل units هست یا نه
    const unitExists = units.some(unit => unit.id === data.unit);
    if (!unitExists) {
      alert("واحد انتخاب شده معتبر نیست");
      return setLoading(false);
    }

    setLoading(true);

    if (!Array.isArray(data.charges) || data.charges.length === 0) {
      alert("حداقل یک شارژ باید وارد کنید");
      setLoading(false);
      return;
    }

    // اعتبارسنجی شارژها
    let hasError = false;
    const validatedCharges = data.charges.map((c, index) => {
      const expireDate = typeof c.expire_date === "string" ? c.expire_date.trim() : "";
      const countNum = Number(c.count);
      const priceNum = Number(c.price);

      if (!expireDate) {
        console.warn(`شارژ شماره ${index + 1}: تاریخ انقضا خالیه`);
        hasError = true;
      }
      if (isNaN(countNum) || countNum < 0) {
        console.warn(`شارژ شماره ${index + 1}: تعداد نامعتبره`);
        hasError = true;
      }
      if (isNaN(priceNum) || priceNum < 0) {
        console.warn(`شارژ شماره ${index + 1}: قیمت نامعتبره`);
        hasError = true;
      }

      return {
        expire_date: expireDate,
        count: countNum,
        price: priceNum,
      };
    });

    if (hasError) {
      alert("مقادیر شارژ رو درست وارد کنید");
      setLoading(false);
      return;
    }

    const payload = {
      ...data,
      charges: validatedCharges,
    };

    console.log("payload to send:", payload);

    try {
      await addProduct(token, payload);
      alert("ثبت با موفقیت انجام شد");
      setModalOpen(false);
    } catch (e) {
      console.error("Server error:", e);

      if (e.response && e.response.data) {
        const errors = e.response.data;

        if (errors.charges && Array.isArray(errors.charges)) {
          let msg = "مشکلات شارژ:\n";
          errors.charges.forEach((chargeErr, i) => {
            if (chargeErr && typeof chargeErr === "object") {
              Object.entries(chargeErr).forEach(([field, messages]) => {
                msg += `شارژ ${i + 1} → ${field}: ${messages.join(", ")}\n`;
              });
            }
          });
          alert(msg);
        } else {
          alert("خطا: " + JSON.stringify(errors));
        }
      } else {
        alert("خطای ناشناخته در سرور");
      }
    } finally {
      setLoading(false);
    }
  }}
/>



      </main>
    </div>
  );
}
