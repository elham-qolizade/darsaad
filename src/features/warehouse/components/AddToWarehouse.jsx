import React, { useState,useEffect } from "react";
import { addProduct } from "../../service/warehouse.api";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";

export default function AddProductModal({
  modalOpen,
  setModalOpen,
  units = [],
  categories = [],
  loading,
  setLoading,
  error,
  setError,
  token,
}) {
  // فرم داده‌ها
  const [form, setForm] = useState({
    title: "",
    unit: "",
    categories: [],
    perishable: false,
    stock_alert_on: "",
    unit_price: "",
    charges: [{ expire_date: "", count: "", price: "" }],
  });
  const [localCategories, setLocalCategories] = useState(categories);

  // خطاهای فرم
  const [formErrors, setFormErrors] = useState({});
  // const [categories, setCategories] = useState([]);

  // وقتی فیلدی تغییر می‌کنه، مقدارش رو تو state بذار و خطاشو پاک کن
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };
  useEffect(() => {
    async function fetchCategories() {
      const res = await getCategoriesAPI(token);
      setCategories(res || []);
    }
    fetchCategories();
  }, []);
  
  // تغییر تو شارژها
  const handleChargeChange = (index, field, value) => {
    setForm((prev) => {
      const updatedCharges = [...prev.charges];
      updatedCharges[index][field] = value;
      return { ...prev, charges: updatedCharges };
    });

    // اگه مثلا برای تاریخ یا تعداد یا قیمت شارژ خطا بود، اونم پاکش کن
    setFormErrors((prev) => ({
      ...prev,
      [`charge_${field}_${index}`]: null,
    }));
  };

  // اضافه کردن شارژ جدید
  const addCharge = () => {
    setForm((prev) => ({
      ...prev,
      charges: [...prev.charges, { expire_date: "", count: "", price: "" }],
    }));
  };

  // حذف شارژ بر اساس ایندکس
  const removeCharge = (index) => {
    setForm((prev) => ({
      ...prev,
      charges: prev.charges.filter((_, i) => i !== index),
    }));

    // همچنین خطاهای مربوط به اون شارژ رو هم حذف کن
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`charge_expire_date_${index}`];
      delete newErrors[`charge_count_${index}`];
      delete newErrors[`charge_price_${index}`];
      return newErrors;
    });
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) errors.title = "نام محصول الزامی است.";
    if (!form.unit) errors.unit = "واحد محصول را انتخاب کنید.";
    if (form.categories.length === 0) errors.categories = "حداقل یک دسته‌بندی انتخاب شود.";
    if (form.stock_alert_on && isNaN(Number(form.stock_alert_on)))
      errors.stock_alert_on = "مقدار هشدار موجودی باید عدد باشد.";
    if (!form.unit_price || isNaN(Number(form.unit_price)) || Number(form.unit_price) <= 0)
      errors.unit_price = "قیمت واحد باید عدد مثبت باشد.";

    form.charges.forEach((charge, idx) => {
      const hasAnyValue = charge.expire_date || charge.count || charge.price;
      if (hasAnyValue) {
        if (!charge.expire_date)
          errors[`charge_expire_date_${idx}`] = `تاریخ انقضا شارژ ${idx + 1} الزامی است.`;
        if (!charge.count || isNaN(Number(charge.count)) || Number(charge.count) <= 0)
          errors[`charge_count_${idx}`] = `تعداد شارژ ${idx + 1} باید عدد مثبت باشد.`;
        if (!charge.price || isNaN(Number(charge.price)) || Number(charge.price) <= 0)
          errors[`charge_price_${idx}`] = `قیمت شارژ ${idx + 1} باید عدد مثبت باشد.`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // تبدیل تاریخ شمسی به میلادی
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

  // ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    // اعتبارسنجی شارژها و تبدیل تاریخ
    let hasError = false;
    const validatedCharges = form.charges.map((c, index) => {
      const expireDate = typeof c.expire_date === "string" ? c.expire_date.trim() : "";
      const countNum = Number(c.count);
      const priceNum = Number(c.price);

      let expireDateGregorian = "";
      if (expireDate) {
        try {
          expireDateGregorian = new DateObject({
            date: expireDate,
            calendar: persian,
            locale: persian_fa,
          })
            .convert()
            .format("YYYY-MM-DD");
        } catch (err) {
          console.warn(`شارژ شماره ${index + 1}: تاریخ انقضا نامعتبر است.`);
          hasError = true;
        }
      }

      if (!expireDate) {
        console.warn(`شارژ شماره ${index + 1}: تاریخ انقضا خالی است`);
        hasError = true;
      }
      if (isNaN(countNum) || countNum <= 0) {
        console.warn(`شارژ شماره ${index + 1}: تعداد نامعتبر است`);
        hasError = true;
      }
      if (isNaN(priceNum) || priceNum <= 0) {
        console.warn(`شارژ شماره ${index + 1}: قیمت نامعتبر است`);
        hasError = true;
      }

      return {
        expire_date: expireDateGregorian,
        count: countNum,
        price: priceNum,
      };
    });

    if (hasError) {
      alert("مقادیر شارژ را به درستی وارد کنید.");
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      unit: form.unit,
      categories: form.categories,
      perishable: form.perishable,
      stock_alert_on: Number(form.stock_alert_on) || 0,
      unit_price: Number(form.unit_price) || 0,
      charges: validatedCharges,
    };

    try {
      await addProduct(token, payload);
      alert("ثبت با موفقیت انجام شد");
      setModalOpen(false);

      // ریست فرم
      setForm({
        title: "",
        unit: "",
        categories: [],
        perishable: false,
        stock_alert_on: "",
        unit_price: "",
        charges: [{ expire_date: "", count: "", price: "" }],
      });
      setFormErrors({});
    } catch (err) {
      console.error("خطا در ثبت محصول:", err);
      alert("خطا در ثبت محصول، دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  if (!modalOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto space-y-6 text-right"
      >
        <h2 className="text-center text-lg font-bold mb-4">ثبت ماده اولیه جدید</h2>

        {/* نام محصول */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="title">
            نام محصول
          </label>
          <input
            id="title"
            type="text"
            placeholder="نام محصول"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={`input w-full p-2 border rounded ${
              formErrors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.title && (
            <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
          )}
        </div>

        {/* واحد محصول */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="unit">
            واحد محصول
          </label>
          <select
            id="unit"
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            className={`w-full p-2 rounded border ${
              formErrors.unit ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">انتخاب واحد</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          {formErrors.unit && (
            <p className="text-red-600 text-sm mt-1">{formErrors.unit}</p>
          )}
        </div>

        {/* دسته‌بندی */}
        <div>
  <label className="block mb-1 font-semibold" htmlFor="categories">
    دسته‌بندی
  </label>
  <select
  id="categories"
  value={form.categories[0] || ""}
  onChange={(e) => {
    if (e.target.value === "add_new") {
      const newCategory = prompt("نام دسته‌بندی جدید را وارد کنید:");
      if (newCategory) {
        const newCatObj = { id: Date.now(), title: newCategory };
        setLocalCategories([...localCategories, newCatObj]);
        handleChange("categories", [newCatObj.id]);
      }
    } else {
      handleChange("categories", e.target.value ? [e.target.value] : []);
    }
  }}
  className={`input w-full p-2 border rounded ${
    formErrors.categories ? "border-red-500" : "border-gray-300"
  }`}
>
  <option value="">انتخاب دسته‌بندی</option>
  {localCategories.map((cat) => (
  <option key={cat.id} value={cat.id}>
    {cat.title}
  </option>
))}
  <option value="add_new">+ افزودن دسته‌بندی جدید</option>
</select>

  {formErrors.categories && (
    <p className="text-red-600 text-sm mt-1">{formErrors.categories}</p>
  )}
</div>


        {/* کالا فاسد شدنی */}
        <div className="flex items-center gap-2">
          <input
            id="perishable"
            type="checkbox"
            checked={form.perishable}
            onChange={(e) => handleChange("perishable", e.target.checked)}
            className="cursor-pointer"
          />
          <label htmlFor="perishable" className="cursor-pointer select-none">
            کالا فاسد شدنی است
          </label>
        </div>

        {/* هشدار موجودی */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="stock_alert_on">
            هشدار موجودی (اختیاری)
          </label>
          <input
            id="stock_alert_on"
            type="number"
            placeholder="مثلاً 10"
            value={form.stock_alert_on}
            onChange={(e) => handleChange("stock_alert_on", e.target.value)}
            className={`input w-full p-2 border rounded ${
              formErrors.stock_alert_on ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.stock_alert_on && (
            <p className="text-red-600 text-sm mt-1">{formErrors.stock_alert_on}</p>
          )}
        </div>

        {/* قیمت واحد */}
        {/* <div>
          <label className="block mb-1 font-semibold" htmlFor="unit_price">
            قیمت واحد
          </label>
          <input
            id="unit_price"
            type="number"
            placeholder="مثلاً 10000"
            value={form.unit_price}
            onChange={(e) => handleChange("unit_price", e.target.value)}
            className={`input w-full p-2 border rounded ${
              formErrors.unit_price ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.unit_price && (
            <p className="text-red-600 text-sm mt-1">{formErrors.unit_price}</p>
          )}
        </div> */}

        {/* شارژها */}
        <div>
          <label className="block mb-2 font-semibold">شارژها</label>
          {form.charges.map((charge, idx) => (
            <div
              key={idx}
              className="border p-3 rounded mb-3 relative flex flex-col gap-3"
            >
              {/* تاریخ انقضا */}
              <div>
                <label
                  className="block mb-1 font-semibold"
                  htmlFor={`expire_date_${idx}`}
                >
                  تاریخ انقضا
                </label>
                <DatePicker
                  id={`expire_date_${idx}`}
                  calendar={persian}
                  locale={persian_fa}
                  value={charge.expire_date}
                  onChange={(date) =>
                    handleChargeChange(idx, "expire_date", date?.format("YYYY/MM/DD"))
                  }
                  format="YYYY/MM/DD"
                  inputClass={`w-full p-2 border rounded ${
                    formErrors[`charge_expire_date_${idx}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  calendarPosition="bottom-right"
                  placeholder="مثلاً ۱۴۰۲/۰۵/۲۵"
                />
                {formErrors[`charge_expire_date_${idx}`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors[`charge_expire_date_${idx}`]}
                  </p>
                )}
              </div>

              {/* تعداد */}
              <div>
                <label
                  className="block mb-1 font-semibold"
                  htmlFor={`count_${idx}`}
                >
                  تعداد
                </label>
                <input
                  id={`count_${idx}`}
                  type="number"
                  value={charge.count}
                  onChange={(e) =>
                    handleChargeChange(idx, "count", e.target.value)
                  }
                  className={`w-full p-2 rounded border ${
                    formErrors[`charge_count_${idx}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formErrors[`charge_count_${idx}`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors[`charge_count_${idx}`]}
                  </p>
                )}
              </div>

              {/* قیمت */}
              <div>
                <label
                  className="block mb-1 font-semibold"
                  htmlFor={`price_${idx}`}
                >
                  قیمت
                </label>
                <input
                  id={`price_${idx}`}
                  type="number"
                  value={charge.price}
                  onChange={(e) =>
                    handleChargeChange(idx, "price", e.target.value)
                  }
                  className={`w-full p-2 rounded border ${
                    formErrors[`charge_price_${idx}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formErrors[`charge_price_${idx}`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {formErrors[`charge_price_${idx}`]}
                  </p>
                )}
              </div>

              {/* حذف شارژ */}
              {form.charges.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCharge(idx)}
                  className="absolute top-1 right-1 text-red-500 font-bold text-xl hover:text-red-700"
                  title="حذف شارژ"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addCharge}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1"
          >
            اضافه کردن شارژ جدید
          </button>
        </div>

        {/* دکمه ارسال */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2"
          >
            {loading ? "در حال ارسال..." : "ثبت"}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            disabled={loading}
            className="bg-gray-300 hover:bg-gray-400 rounded px-4 py-2"
          >
            انصراف
          </button>
        </div>

        {/* خطای کلی */}
        {error && (
          <p className="text-red-600 text-center mt-3 font-semibold">{error}</p>
        )}
      </form>
    </div>
  );
}
