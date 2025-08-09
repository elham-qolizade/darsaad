import React, { useState, useEffect, useMemo } from "react";
import { postStockPurchase, postWaste } from "../../service/stock.api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { DateObject } from "react-multi-date-picker";
import { fetchUnits } from "../../../api/unitApi";
// import { convertEnglishNumbersToPersian } from "../../../utils/numberUtils";
import { convertEnglishNumbersToPersian, convertPersianNumbersToEnglish } from '../../../utils/numberUtils';

export default function ProductCard({ product }) {
  const [units, setUnits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showWasteForm, setShowWasteForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const token = useMemo(() => localStorage.getItem("accessToken"), []);
  // const normalizedCount = convertPersianNumbersToEnglish(values.count);
  // const normalizedPrice = convertPersianNumbersToEnglish(values.price);
  
  // فرم ضایعات
  const [wasteForm, setWasteForm] = useState({
    count: "",
    unit: "",
    description: "",
  });

  useEffect(() => {
    async function getUnits() {
      if (!token) return;
      try {
        const data = await fetchUnits(token);
        setUnits(data || []);
      } catch (error) {
        console.error("خطا در دریافت واحدها:", error);
      }
    }
    getUnits();
  }, [token]);

  const handleWasteChange = (e) => {
    setWasteForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    setMessage("");
  };
  const handleWasteSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
  
    const validationErrors = validateWasteForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    if (!token) {
      setMessage("❌ توکن پیدا نشد. لطفاً دوباره وارد شو.");
      return;
    }
  
    setLoading(true);
    try {
      const normalizedCount = convertPersianNumbersToEnglish(wasteForm.count);
      const productTitle =
      product.substance?.title || product.name || "";
    
    const payload = {
      products: [],
      substances: [
        {
          substance: product.substance?.id || product.id,
          unit: wasteForm.unit,
          count: parseFloat(normalizedCount),
          description:
            wasteForm.description?.trim() ||
            (productTitle ? `ضایعات برای ${productTitle}` : "ضایعات"),
        },
      ],
    };
    
  
      await postWaste(token, payload);
      setMessage("✅ ثبت ضایعات با موفقیت انجام شد");
      setWasteForm({ count: "", unit: "", description: "" });
      setErrors({});
      setShowWasteForm(false);
    } catch (err) {
      console.log("خطاهای برگشتی:", err.response?.data);
      setErrors(err.response?.data || {});
      setMessage("❌ خطا در ثبت ضایعات");
    } finally {
      setLoading(false);
    }
  };
  
  const validateWasteForm = () => {
    const errs = {};
  
 
    const normalizedCount = convertPersianNumbersToEnglish(wasteForm.count);
  
    if (!normalizedCount) {
      errs.count = "تعداد ضایعات لازم است";
    } else if (isNaN(normalizedCount) || parseFloat(normalizedCount) <= 0) {
      errs.count = "تعداد باید عددی مثبت باشد";
    }
  
    if (!wasteForm.unit) {
      errs.unit = "انتخاب واحد الزامی است";
    }
  
    return errs;
  };
  



 
  const chargeSchema = Yup.object().shape({
    expire_date: Yup.string().required("تاریخ انقضا لازم است"),
    count: Yup.number()
      .transform((value, originalValue) => {
        // تبدیل عدد فارسی به انگلیسی قبل ولیدیشن
        if (typeof originalValue === "string") {
          const converted = convertPersianNumbersToEnglish(originalValue);
          return Number(converted);
        }
        return value;
      })
      .required("تعداد لازم است")
      .positive("باید عدد مثبت باشد"),
    price: Yup.number()
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          const converted = convertPersianNumbersToEnglish(originalValue);
          return Number(converted);
        }
        return value;
      })
      .required("قیمت لازم است")
      .positive("باید عدد مثبت باشد"),
    description: Yup.string(),
  });
  

  const handleChargeSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setMessage("");
    setErrors({});
  
    if (!token) {
      setMessage("❌ توکن پیدا نشد. لطفاً دوباره وارد شو.");
      setLoading(false);
      setSubmitting(false);
      return;
    }
  
    const normalizedCount = convertPersianNumbersToEnglish(values.count);
    const normalizedPrice = convertPersianNumbersToEnglish(values.price);
  
    const formatDate = (date) => {
      if (!date) return "";
      if (typeof date === "string") return date.replace(/\//g, "-");
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
  
    const payload = {
      paid_at: new Date().toISOString().slice(0, 10),
      status: 1,
      offer: 0,
      description:
        values.description || `شارژ انبار برای ${product.substance?.title || product.name}`,
      add_to_stock: true,
      items: [
        {
          substance: product.substance?.id || product.id,
          expire_date: formatDate(values.expire_date),
          count: parseFloat(normalizedCount),
          price: parseFloat(normalizedPrice),
        },
      ],
    };
  
    try {
      await postStockPurchase(token, payload);
      setMessage("✅ شارژ با موفقیت انجام شد");
      setShowForm(false);
      resetForm();
    } catch (err) {
      setMessage("❌ خطا در شارژ موجودی");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  ;


  const totalCount = product.active_inventories
    ? product.active_inventories.reduce(
        (sum, inv) => sum + parseFloat(inv.remained || "0"),
        0
      )
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4">
      {/* دکمه‌ها و اطلاعات محصول */}
      <div className="flex flex-col-reverse md:flex-row-reverse justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setShowWasteForm(false);
              setMessage("");
              setErrors({});
            }}
            className="bg-[#0A2A57] text-white px-6 py-1 rounded-md text-xs hover:bg-custom-blue transition w-full md:w-auto"
          >
            {showForm ? "لغو" : "شارژ انبار"}
          </button>
          <button
            onClick={() => {
              setShowWasteForm((v) => !v);
              setShowForm(false);
              setMessage("");
              setErrors({});
            }}
            className="bg-red-600 text-white px-6 py-1 rounded-md text-xs hover:bg-red-700 transition w-full md:w-auto"
          >
            {showWasteForm ? "لغو" : "ثبت ضایعات انبار"}
          </button>
        </div>

        <div className="text-sm space-y-1 text-right flex-1 w-full md:w-auto">
          <div className="font-semibold">{product.title || "نام محصول"}</div>

          <div className="text-gray-600 text-xs">
  تاریخ انقضا:{" "}
  {product.active_inventories?.[0]?.expire_date
    ? convertEnglishNumbersToPersian(
        new Date(product.active_inventories[0].expire_date).toLocaleDateString("fa-IR")
      )
    : "نامشخص"}
</div>

<div className="text-gray-600 text-xs">
  قیمت:{" "}
  {product.active_inventories?.[0]?.price
    ? convertEnglishNumbersToPersian(
        product.active_inventories[0].price.toLocaleString()
      )
    : "نامشخص"}
</div>

<div className="text-gray-600 text-xs">
  تعداد موجود:{" "}
  {convertEnglishNumbersToPersian(
    product.active_inventories?.reduce(
      (sum, inv) => sum + parseFloat(inv.remained || 0),
      0
    ) || 0
  )}{" "}
  {product.unit?.name || "بدون واحد"}
</div>

        </div>
      </div>

      {/* فرم شارژ با Formik */}
      {showForm && (
        <Formik
          initialValues={{
            expire_date: "",
            count: "",
            price: "",
            description: "",
          }}
          validationSchema={chargeSchema}
          onSubmit={handleChargeSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="bg-gray-100 p-3 rounded-md space-y-2 text-xs w-full max-w-md mx-auto">
              <label htmlFor="expire_date" className="block font-semibold mb-1">
                تاریخ انقضا
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={
                  values.expire_date
                    ? new DateObject({
                        calendar: persian,
                        locale: persian_fa,
                        date: values.expire_date,
                      })
                    : null
                }
                onChange={(date) => {
                  setFieldValue("expire_date", date.format("YYYY/MM/DD"));
                }}
                format="YYYY/MM/DD"
                inputClass="w-full px-2 py-1 rounded border border-gray-300"
                id="expire_date"
              />
              <ErrorMessage
                name="expire_date"
                component="div"
                className="text-red-600 text-xs"
              />

              <label htmlFor="count" className="block font-semibold mt-2 mb-1">
                تعداد
              </label>
              <Field
         type="text"
                name="count"
                id="count"
                placeholder="تعداد"
                className="w-full px-2 py-1 rounded border border-gray-300"
              />
              <ErrorMessage
                name="count"
                component="div"
                className="text-red-600 text-xs"
              />

              <label htmlFor="price" className="block font-semibold mt-2 mb-1">
                قیمت
              </label>
              <Field
               type="text"
                name="price"
                id="price"
                placeholder="قیمت"
                className="w-full px-2 py-1 rounded border border-gray-300"
              />
              <ErrorMessage
                name="price"
                component="div"
                className="text-red-600 text-xs"
              />

              <label htmlFor="description" className="block font-semibold mt-2 mb-1">
                توضیحات (اختیاری)
              </label>
              <Field
                as="textarea"
                name="description"
                id="description"
                placeholder="توضیحات"
                className="w-full px-2 py-1 rounded border border-gray-300 resize-none"
              />

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="bg-[#0A2A57] text-white rounded-md px-4 py-1 mt-3 w-full disabled:opacity-50"
              >
                {loading ? "در حال ارسال..." : "ثبت شارژ"}
              </button>
              {message && (
                <div
                  className={`mt-2 ${
                    message.startsWith("✅")
                      ? "text-green-600"
                      : "text-red-600"
                  } text-xs`}
                >
                  {message}
                </div>
              )}
            </Form>
          )}
        </Formik>
      )}

      {/* فرم ضایعات */}
      {showWasteForm && (
        <form
          onSubmit={handleWasteSubmit}
          className="bg-gray-100 p-3 rounded-md space-y-2 text-xs w-full max-w-md mx-auto"
        >
          <label htmlFor="count" className="block font-semibold mb-1">
            تعداد ضایعات
          </label>
          <input
            type="text"
            name="count"
            id="count"
            value={wasteForm.count}
            onChange={handleWasteChange}
            className="w-full px-2 py-1 rounded border border-gray-300"
            placeholder="تعداد ضایعات"
          />
          {errors.count && (
            <div className="text-red-600 text-xs">{errors.count}</div>
          )}

          <label htmlFor="unit" className="block font-semibold mt-2 mb-1">
            واحد
          </label>
          <select
            name="unit"
            id="unit"
            value={wasteForm.unit}
            onChange={handleWasteChange}
            className="w-full px-2 py-1 rounded border border-gray-300"
          >
            <option value="">انتخاب واحد</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          {errors.unit && (
            <div className="text-red-600 text-xs">{errors.unit}</div>
          )}

          <label htmlFor="description" className="block font-semibold mt-2 mb-1">
            توضیحات (اختیاری)
          </label>
          <textarea
            name="description"
            id="description"
            value={wasteForm.description}
            onChange={handleWasteChange}
            className="w-full px-2 py-1 rounded border border-gray-300 resize-none"
            placeholder="توضیحات"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white rounded-md px-4 py-1 mt-3 w-full disabled:opacity-50"
          >
            {loading ? "در حال ارسال..." : "ثبت ضایعات"}
          </button>
          {message && (
            <div
              className={`mt-2 ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : "text-red-600"
              } text-xs`}
            >
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
