import React, { useState } from "react";
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
  const [form, setForm] = useState({
    title: "",
    unit: "",
    categories: [],
    perishable: false,
    stock_alert_on: "",
    unit_price: "",
    charges: [{ expire_date: "", count: "", price: "" }],
  });

  const [formErrors, setFormErrors] = useState({});

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
  };

  const addCharge = () => {
    setForm((prev) => ({
      ...prev,
      charges: [...prev.charges, { expire_date: "", count: "", price: "" }],
    }));
  };

  const removeCharge = (index) => {
    setForm((prev) => ({
      ...prev,
      charges: prev.charges.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "نام محصول الزامی است.";
    if (!form.unit) errors.unit = "واحد محصول را انتخاب کنید.";
    if (form.categories.length === 0) errors.categories = "حداقل یک دسته‌بندی انتخاب شود.";
    if (form.stock_alert_on && isNaN(Number(form.stock_alert_on))) errors.stock_alert_on = "مقدار هشدار موجودی باید عدد باشد.";
    if (!form.unit_price || isNaN(Number(form.unit_price)) || Number(form.unit_price) <= 0)
      errors.unit_price = "قیمت واحد باید عدد مثبت باشد.";

    form.charges.forEach((charge, idx) => {
      if (charge.expire_date || charge.count || charge.price) {
        if (!charge.expire_date) errors[`charge_expire_date_${idx}`] = `تاریخ انقضا شارژ ${idx + 1} الزامی است.`;
        if (!charge.count || isNaN(Number(charge.count)) || Number(charge.count) <= 0)
          errors[`charge_count_${idx}`] = `تعداد شارژ ${idx + 1} باید عدد مثبت باشد.`;
        if (!charge.price || isNaN(Number(charge.price)) || Number(charge.price) <= 0)
          errors[`charge_price_${idx}`] = `قیمت شارژ ${idx + 1} باید عدد مثبت باشد.`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    const validatedCharges = form.charges.filter(
      (ch) => ch.expire_date && ch.count && ch.price
    );

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
      if (err.response && err.response.data) {
        const errors = err.response.data;
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
        } else if (typeof errors === "object") {
          alert("خطا: " + JSON.stringify(errors));
        } else {
          alert("خطای ناشناخته در سرور");
        }
      } else {
        alert("خطای ناشناخته در سرور");
      }
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
        <h2 className="text-center">ثبت ماده اولیه جدید</h2>
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

        <div>
          <label className="block mb-1 font-semibold" htmlFor="categories">
            دسته‌بندی
          </label>
          <select
            id="categories"
            value={form.categories[0] || ""}
            onChange={(e) =>
              handleChange("categories", e.target.value ? [e.target.value] : [])
            }
            className={`input w-full p-2 border rounded ${
              formErrors.categories ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
          {formErrors.categories && (
            <p className="text-red-600 text-sm mt-1">{formErrors.categories}</p>
          )}
        </div>

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

        <div>
          <input
            id="unit_price"
            type="number"
            placeholder="قیمت واحد"
            value={form.unit_price}
            onChange={(e) => handleChange("unit_price", e.target.value)}
            className={`input w-full p-2 border rounded ${
              formErrors.unit_price ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.unit_price && (
            <p className="text-red-600 text-sm mt-1">{formErrors.unit_price}</p>
          )}
        </div>

        <div>
          {form.charges.map((charge, index) => (
            <div
              key={index}
              className="mb-4"
              style={{ direction: "ltr" }}
            >
              <div className="flex flex-col mb-2">
                <label
                  className="text-sm font-semibold mb-1"
                  htmlFor={`expire_date_${index}`}
                >
                  تاریخ انقضا
                </label>
                <DatePicker
  value={
    charge.expire_date
      ? new DateObject(charge.expire_date).convert(persian)
      : null
  }
  onChange={(date) => {
    if (!date) {
      handleChargeChange(index, "expire_date", "");
      return;
    }
    const gregorianDate = new DateObject(date).convert("gregorian");
    handleChargeChange(index, "expire_date", gregorianDate.format("YYYY-MM-DD"));
  }}
  calendar={persian}
  locale={persian_fa}
  format="YYYY/MM/DD"
  inputClass={`input p-2 border rounded ${
    formErrors[`charge_expire_date_${index}`] ? "border-red-500" : "border-gray-300"
  }`}
/>

                {formErrors[`charge_expire_date_${index}`] && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors[`charge_expire_date_${index}`]}
                  </p>
                )}
              </div>

              <div className="flex flex-col mb-2">
                <label
                  className="text-sm font-semibold mb-1"
                  htmlFor={`count_${index}`}
                >
                  تعداد
                </label>
                <input
                  id={`count_${index}`}
                  type="number"
                  value={charge.count}
                  onChange={(e) =>
                    handleChargeChange(index, "count", e.target.value)
                  }
                  className={`input p-2 border rounded ${
                    formErrors[`charge_count_${index}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formErrors[`charge_count_${index}`] && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors[`charge_count_${index}`]}
                  </p>
                )}
              </div>

              <div className="flex flex-col mb-2">
                <label
                  className="text-sm font-semibold mb-1"
                  htmlFor={`price_${index}`}
                >
                  قیمت شارژ
                </label>
                <input
                  id={`price_${index}`}
                  type="number"
                  value={charge.price}
                  onChange={(e) =>
                    handleChargeChange(index, "price", e.target.value)
                  }
                  className={`input p-2 border rounded ${
                    formErrors[`charge_price_${index}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formErrors[`charge_price_${index}`] && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors[`charge_price_${index}`]}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeCharge(index)}
                className="text-red-600 hover:text-red-800 text-sm mt-1"
              >
                حذف شارژ
              </button>
              <hr className="my-3" />
            </div>
          ))}

          <button
            type="button"
            onClick={addCharge}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            افزودن شارژ جدید
          </button>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
            }`}
          >
            ثبت
          </button>
        </div>
      </form>
    </div>
  );
}
