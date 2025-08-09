import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from "yup";
import { convertPersianNumbersToEnglish } from "../../../utils/numberUtils"; 

const schema = yup
  .object({
    title: yup.string().required("نام ماده اولیه الزامی است"),
    unit: yup.string().required("واحد انبار را انتخاب کنید"),
    categories: yup
      .array()
      .of(yup.string())
      .min(1, "دسته‌بندی الزامی است"),
    unit_price: yup
      .number()
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          const englishValue = convertPersianNumbersToEnglish(originalValue);
          return parseFloat(englishValue);
        }
        return value;
      })
      .typeError("قیمت باید عدد باشد")
      .min(0, "قیمت نمی‌تواند منفی باشد")
      .required("قیمت واحد الزامی است"),
    stock_alert_on: yup
      .number()
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          const englishValue = convertPersianNumbersToEnglish(originalValue);
          return parseFloat(englishValue);
        }
        return value;
      })
      .typeError("حداقل موجودی باید عدد باشد")
      .min(0, "مقدار نمی‌تواند منفی باشد")
      .required("حداقل موجودی الزامی است"),
    perishable: yup.boolean(),
  })
  .required();
// const validateWasteForm = () => {
//   const errs = {};

//   const normalizedCount = convertPersianNumbersToEnglish(wasteForm.count);

//   if (!normalizedCount) {
//     errs.count = "تعداد ضایعات لازم است";
//   } else if (isNaN(normalizedCount) || parseFloat(normalizedCount) <= 0) {
//     errs.count = "تعداد باید عددی مثبت باشد";
//   }

//   if (!wasteForm.unit) {
//     errs.unit = "انتخاب واحد الزامی است";
//   }

//   return errs;
// };

const handleWasteSubmit = () => {
  const validationErrors = validateWasteForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  const finalData = {
    ...wasteForm,
    count: parseFloat(
      convertPersianNumbersToEnglish(wasteForm.count)
    ), // همیشه به عدد تبدیل میشه
  };

  console.log("ارسال داده:", finalData);
  // اینجا درخواست API بزن
};

const AddProductModal = ({
  modalOpen,
  setModalOpen,
  productData,
  units,
  categories,
  loading,
  error,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: productData,
  });

  React.useEffect(() => {
    reset(productData); // ریست فرم وقتی داده‌های محصول عوض میشن
  }, [productData, reset]);

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <form
        dir="rtl"
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg p-6 w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg flex flex-col gap-4 overflow-auto max-h-[90vh]"
      >
        <h2 className="text-xl font-bold mb-4 text-center">ثبت ماده اولیه جدید</h2>

        <label className="flex flex-col">
          نام ماده اولیه
          <input
            type="text"
            {...register("title")}
            className="border border-gray-300 rounded p-2 mt-1"
          />
          {errors.title && <p className="text-red-600">{errors.title.message}</p>}
        </label>

        <label className="flex flex-col">
          واحد انبار
          <select
            {...register("unit")}
            className="border border-gray-300 rounded p-2 mt-1"
          >
            <option value="">انتخاب کنید</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          {errors.unit && <p className="text-red-600">{errors.unit.message}</p>}
        </label>

        <label className="flex flex-col">
          دسته‌بندی
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value?.[0] || ""}
                onChange={(e) => field.onChange([e.target.value])}
                className="border border-gray-300 rounded p-2 mt-1"
              >
                <option value="">انتخاب کنید</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.categories && (
            <p className="text-red-600">{errors.categories.message}</p>
          )}
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("perishable")} />
          محصول فاسدشدنی است
        </label>

        <label className="flex flex-col">
          هشدار حداقل موجودی
          <input
            type="text"
            {...register("stock_alert_on")}
            min={0}
            className="border border-gray-300 rounded p-2 mt-1"
          />
          {errors.stock_alert_on && (
            <p className="text-red-600">{errors.stock_alert_on.message}</p>
          )}
        </label>

        <label className="flex flex-col">
          قیمت واحد (ریال)
          <input
            type="text"
            {...register("unit_price")}
            min={0}
            className="border border-gray-300 rounded p-2 mt-1"
          />
          {errors.unit_price && (
            <p className="text-red-600">{errors.unit_price.message}</p>
          )}
        </label>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 w-full sm:w-auto"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0A2A57] text-white px-4 py-2 rounded hover:bg-custom-blue w-full sm:w-auto"
          >
            {loading ? "در حال ثبت..." : "ثبت"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductModal;

