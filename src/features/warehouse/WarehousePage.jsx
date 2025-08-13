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
  const [units, setUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPageStock, setHasNextPageStock] = useState(false);
  const [hasPrevPageStock, setHasPrevPageStock] = useState(false);

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
      console.error("Error adding product:", error);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const getCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories("");
      try {
        const data = await fetchCategories(token);
        setCategories(data.results || []);
      } catch {
        setErrorCategories("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    if (token) getCategories();
  }, [token]);

  useEffect(() => {
    async function fetchStock() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchStockItems(token, currentPage, selectedCategories);
        setStockItems(data.results || []);
        setHasNextPageStock(Boolean(data.next));
        setHasPrevPageStock(Boolean(data.previous));
      } catch (error) {
        setError("Failed to load warehouse data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStock();
  }, [token, currentPage, selectedCategories]);
  
  useEffect(() => {
    async function loadUnits() {
      if (!token) return;
      try {
        const res = await fetch("https://django-bingo.chbk.app/en/api/units/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnits(data.results || []);
      } catch (err) {
        console.error("Failed to load units:", err);
      }
    }
    loadUnits();
  }, [token]);

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId];
      return newCategories;
    });
    setCurrentPage(1);
  };

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
      alert("Raw material added successfully!");
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
      setError(err.response?.data?.detail || err.message || "Failed to submit data");
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
    <div  className="flex flex-col md:flex-row min-h-screen bg-gray-100 ">
       <Sidebar />
    <main dir="ltr" className="flex-1 justify-center items-center sm:justify-start p-4 md:p-6">
      <div className="flex flex-col items-start gap-4 mb-6"> {/* items-end → items-start */}
        <label className="flex items-center gap-2 text-gray-600 font-medium cursor-pointer select-none">
          Warehouse Purchase
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
          <span className="text-gray-400">Warehouse Waste</span>
        </label>
  
        <div className="flex flex-wrap justify-center items-center gap-2">
        <button
    onClick={() => setModalOpen(true)}
    className="bg-custom-blue items-center text-white px-3 py-1.5 rounded-md flex justify-center gap-1 text-sm hover:bg-[#0C3565] transition w-full sm:w-auto"
  >
        <span className="text-base font-semibold">+</span>
    <span className="text-center">New Raw Material</span>

  </button>
        <div className="hidden sm:block w-px h-6 bg-gray-300 mx-2" />
  
  <div className="hidden sm:flex items-center gap-2">
    <BsFilterRight />
    <p className="font-thin text-sm">Filter</p>
    <FaFilter />
  </div>


          {loadingCategories && <p>Loading categories...</p>}
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
                {cat.english_title}
              </button>
            ))}
  
       
        </div>
      </div>
  
      {/* اینجا dir=rtl رو برداشتم چون میخوای LTR باشه */}
      <div>
        {loading ? (
          <p>Loading products...</p>
        ) : filteredStockItems.length === 0 ? (
          <p>No products found</p>
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
          console.log("Submit clicked", data);
  
          // Validate unit exists
          const unitExists = units.some(unit => unit.id === data.unit);
          if (!unitExists) {
            alert("Selected unit is not valid");
            return setLoading(false);
          }
  
          setLoading(true);
  
          if (!Array.isArray(data.charges) || data.charges.length === 0) {
            alert("You must enter at least one charge");
            setLoading(false);
            return;
          }
  
          // Validate charges
          let hasError = false;
          const validatedCharges = data.charges.map((charge, index) => {
            const expireDate = typeof charge.expire_date === "string" ? charge.expire_date.trim() : "";
            const countNum = Number(charge.count);
            const priceNum = Number(charge.price);
  
            if (!expireDate) {
              console.warn(`Charge #${index + 1}: Expiry date is empty`);
              hasError = true;
            }
            if (isNaN(countNum) || countNum < 0) {
              console.warn(`Charge #${index + 1}: Invalid count`);
              hasError = true;
            }
            if (isNaN(priceNum) || priceNum < 0) {
              console.warn(`Charge #${index + 1}: Invalid price`);
              hasError = true;
            }
  
            return {
              expire_date: expireDate,
              count: countNum,
              price: priceNum,
            };
          });
  
          if (hasError) {
            alert("Please enter valid charge values");
            setLoading(false);
            return;
          }
  
          const payload = {
            ...data,
            charges: validatedCharges,
          };
  
          console.log("Payload to send:", payload);
  
          try {
            await addProduct(token, payload);
            alert("Successfully submitted");
            setModalOpen(false);
          } catch (error) {
            console.error("Server error:", error);
  
            if (error.response && error.response.data) {
              const errors = error.response.data;
  
              if (errors.charges && Array.isArray(errors.charges)) {
                let msg = "Charge errors:\n";
                errors.charges.forEach((chargeError, i) => {
                  if (chargeError && typeof chargeError === "object") {
                    Object.entries(chargeError).forEach(([field, messages]) => {
                      msg += `Charge ${i + 1} → ${field}: ${messages.join(", ")}\n`;
                    });
                  }
                });
                alert(msg);
              } else {
                alert("Error: " + JSON.stringify(errors));
              }
            } else {
              alert("Unknown server error");
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
