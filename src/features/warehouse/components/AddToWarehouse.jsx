import React, { useState,useEffect } from "react";
import { addProduct,fetchCategories } from "../../service/warehouse.api";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import { addCategoryAPI } from "../../service/warehouse.api";
export default function AddProductModal({
  modalOpen,
  setModalOpen,
  units = [],
  token,
  categories, 
  refreshProducts // ✅ از پدر پاس بده تا بعد ثبت فرم لیست رفرش شه
}) {
  // const [categories, setCategories] = useState([]); // ✅ دیگه از props نمی‌گیریم
  const [isImperishable, setIsImperishable] = useState(false);
  const [expireDate, setExpireDate] = useState("");
  const [form, setForm] = useState({
    title: "",
    unit: "",
    categories: [],
    perishable: false,
    stock_alert_on: "",
    unit_price: "",
    expire_date: isImperishable ? null : expireDate,
    charges: [{ expire_date: null, count: "", price: "" }],
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localCategories, setLocalCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // گرفتن دسته‌بندی‌ها
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getCategoriesAPI(token);
        setCategories(res || []);
        setLocalCategories(res || []);
      } catch (err) {
        console.error("خطا در گرفتن دسته‌بندی‌ها:", err);
      }
    }
    fetchCategories();
  }, [token]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleChargeChange = (index, field, value) => {
    setForm((prev) => {
      const updatedCharges = [...prev.charges];
      updatedCharges[index][field] = value;
      return { ...prev, charges: updatedCharges };
    });
    setFormErrors((prev) => ({
      ...prev,
      [`charge_${field}_${index}`]: null,
    }));
  };

  const addCharge = () => {
    setForm((prev) => ({
      ...prev,
      charges: [...prev.charges, { expire_date: null, count: "", price: "" }],
    }));
  };

  const removeCharge = (index) => {
    setForm((prev) => ({
      ...prev,
      charges: prev.charges.filter((_, i) => i !== index),
    }));
  };
  const convertToGregorian = (shamsiDate) => {
    if (!shamsiDate) return "";
    try {
      return new DateObject({
        date: shamsiDate,
        calendar: persian,
        locale: persian_fa,
      })
        .convert()
        .format("YYYY-MM-DD");
    } catch {
      return "";
    }
  };
  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "نام محصول الزامی است.";
    if (!form.unit) errors.unit = "واحد محصول را انتخاب کنید.";
    if (form.categories.length === 0) errors.categories = "حداقل یک دسته‌بندی انتخاب شود.";

    form.charges.forEach((charge, idx) => {
      if (!charge.expire_date)
        errors[`charge_expire_date_${idx}`] = `تاریخ انقضا شارژ ${idx + 1} الزامی است.`;
      if (!charge.count || isNaN(Number(charge.count)) || Number(charge.count) <= 0)
        errors[`charge_count_${idx}`] = `تعداد شارژ ${idx + 1} باید عدد مثبت باشد.`;
      if (!charge.price || isNaN(Number(charge.price)) || Number(charge.price) <= 0)
        errors[`charge_price_${idx}`] = `قیمت شارژ ${idx + 1} باید عدد مثبت باشد.`;
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    // تبدیل تاریخ‌ها به میلادی
    const validatedCharges = form.charges.map((c) => ({
      expire_date: c.expire_date
        ? new DateObject(c.expire_date).convert().format("YYYY-MM-DD")
        : "",
      count: Number(c.count),
      price: Number(c.price),
    }));

    const payload = {
      title: form.title.trim(),
      unit: form.unit,
      categories: form.categories,
      perishable: form.perishable,
      stock_alert_on: Number(form.stock_alert_on) || 0,
      unit_price: Number(form.unit_price) || 0,
      charges: validatedCharges,
    };

    console.log("payload sent:", payload);

    try {
      const res = await addProduct(token, payload);
      alert("ثبت با موفقیت انجام شد ✅");
      setModalOpen(false);
      refreshProducts && refreshProducts(); // ✅ لیست رو رفرش کن
      setForm({
        title: "",
        unit: "",
        categories: [],
        perishable: false,
        stock_alert_on: "",
        unit_price: "",
        charges: [{ expire_date: null, count: "", price: "" }],
      });
      setFormErrors({});
    } catch (err) {
      console.error("خطا در ثبت محصول:", err);
      alert(err.response?.data?.message || "خطا در ثبت محصول");
    } finally {
      setLoading(false);
    }
  };

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto space-y-6">
        <h2 className="text-center text-lg font-bold">ثبت ماده اولیه جدید</h2>

        {/* نام محصول */}
        <div>
          <label>نام محصول</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={`w-full p-2 border rounded ${formErrors.title ? "border-red-500" : "border-gray-300"}`}
          />
          {formErrors.title && <p className="text-red-600 text-sm">{formErrors.title}</p>}
        </div>

        {/* واحد محصول */}
        <div>
          <label>واحد محصول</label>
          <select
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            className={`w-full p-2 rounded border ${formErrors.unit ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">انتخاب واحد</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {formErrors.unit && <p className="text-red-600 text-sm">{formErrors.unit}</p>}
        </div>

        {/* دسته‌بندی */}
        <div>
          <label>دسته‌بندی</label>
          <select
            value={form.categories[0] || ""}
            onChange={(e) => {
              if (e.target.value === "add_new") {
                setShowNewCategoryInput(true);
                // ❌ دسته‌بندی‌ها رو خالی نکن
              } else {
                setShowNewCategoryInput(false);
                handleChange("categories", e.target.value ? [e.target.value] : []);
              }
            }}
            
            className={`w-full p-2 border rounded ${formErrors.categories ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.title}
    </option>
  ))}
            <option value="add_new">+ افزودن دسته‌بندی جدید</option>
            {localCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.title}</option>
              
            ))}
          </select>
          {showNewCategoryInput && (
  <div className="flex mt-2">
    <input
      type="text"
      placeholder="نام دسته‌بندی جدید"
      value={newCategoryName}
      onChange={(e) => setNewCategoryName(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1"
    />
    <button
      type="button"
      className="ml-2 bg-green-500 text-white px-4 py-1 rounded"
      onClick={async () => {
        if (newCategoryName.trim()) {
          try {
            // اول دسته‌بندی رو توی سرور بساز
            const newCat = await addCategoryAPI(token, {
              title: newCategoryName.trim(), // ✅ به جای name
            });
            

            // بعد آی‌دی واقعی که بک‌اند داد رو ست کن
            setLocalCategories((prev) => [...prev, newCat]);
            handleChange("categories", [newCat.id]);

            setNewCategoryName("");
            setShowNewCategoryInput(false);
          } catch (error) {
            console.error(error);
            alert("خطا در ثبت دسته‌بندی جدید");
          }
        }
      }}
    >
      افزودن
    </button>
  </div>
)}
          {formErrors.categories && <p className="text-red-600 text-sm">{formErrors.categories}</p>}
        </div>

        {/* فاسدشدنی */}
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.perishable} onChange={(e) => handleChange("perishable", e.target.checked)} />
          <label>کالا فاسد شدنی است</label>
        </div>

        {/* شارژها */}
        <div>
          <label>شارژها</label>
          {form.charges.map((charge, idx) => (
  <div key={idx} className="border p-3 rounded mb-3 relative">
    <label className="block mb-1 font-semibold">تاریخ انقضا</label>
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={charge.expire_date}
      onChange={(date) => handleChargeChange(idx, "expire_date", date)}
      format="YYYY/MM/DD"
      inputClass={`w-full p-2 border rounded ${formErrors[`charge_expire_date_${idx}`] ? "border-red-500" : "border-gray-300"}`}
    />
    {formErrors[`charge_expire_date_${idx}`] && <p className="text-red-600 text-sm">{formErrors[`charge_expire_date_${idx}`]}</p>}

    <label className="block mt-2 mb-1 font-semibold">تعداد</label>
    <input
      type="text"
      placeholder="تعداد"
      value={charge.count}
      onChange={(e) => handleChargeChange(idx, "count", e.target.value)}
      className={`w-full p-2 border rounded ${formErrors[`charge_count_${idx}`] ? "border-red-500" : "border-gray-300"}`}
    />
    {formErrors[`charge_count_${idx}`] && <p className="text-red-600 text-sm">{formErrors[`charge_count_${idx}`]}</p>}

    <label className="block mt-2 mb-1 font-semibold">قیمت</label>
    <input
      type="text"
      placeholder="قیمت"
      value={charge.price}
      onChange={(e) => handleChargeChange(idx, "price", e.target.value)}
      className={`w-full p-2 border rounded ${formErrors[`charge_price_${idx}`] ? "border-red-500" : "border-gray-300"}`}
    />
    {formErrors[`charge_price_${idx}`] && <p className="text-red-600 text-sm">{formErrors[`charge_price_${idx}`]}</p>}

    {form.charges.length > 1 && (
      <button type="button" onClick={() => removeCharge(idx)} className="absolute top-1 right-1 text-red-600 text-lg">&times;</button>
    )}
  </div>
))}

          <button type="button" onClick={addCharge} className="bg-blue-500 text-white px-3 py-1 rounded">
            اضافه کردن شارژ جدید
          </button>
        </div>

        {/* دکمه‌ها */}
        <div className="flex justify-center gap-4">
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
            {loading ? "در حال ارسال..." : "ثبت"}
          </button>
          <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">انصراف</button>
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
}
