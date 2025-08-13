import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function EditCategoryModal({ category, onClose, onSave }) {
  const initialValues = {
    title: category.title || "",
    english_title: category.english_title || "",
    image: category.image || "",
    is_active: category.is_active || false,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("عنوان الزامی است"),
    english_title: Yup.string(),
    image: Yup.string().url("لینک عکس باید معتبر باشد").nullable(),
    is_active: Yup.boolean(),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    onSave(values);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-bold mb-6 text-center">ویرایش دسته‌بندی</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <label className="block mb-3">
                عنوان
                <Field
                  name="title"
                  className="w-full p-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-custom-blue"
                  placeholder="عنوان را وارد کنید"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-600 text-xs mt-1"
                />
              </label>

              <label className="block mb-3">
                عنوان انگلیسی
                <Field
                  name="english_title"
                  className="w-full p-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-custom-blue"
                  placeholder="English title (optional)"
                />
                <ErrorMessage
                  name="english_title"
                  component="div"
                  className="text-red-600 text-xs mt-1"
                />
              </label>


              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  لغو
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-custom-blue text-white rounded hover:bg-custom-blue transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

