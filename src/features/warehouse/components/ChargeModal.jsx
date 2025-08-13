import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import DatePicker from "@hassanmojab/react-modern-calendar-datepicker";
import { persian, persian_fa } from "react-modern-calendar-datepicker";
import { chargeSchema } from "../validationSchemas";
props: show, onClose, handleChargeSubmit, loading, message

export default function ChargeModal({
  show,
  onClose,
  handleChargeSubmit,
  loading,
  message,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-md p-5 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
        >
          ✖
        </button>
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
            <Form className="space-y-3 text-xs">
              <label htmlFor="expire_date" className="font-semibold">
                تاریخ انقضا
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={
                  values.expire_date
                    ? new Date(values.expire_date)
                    : null
                }
                onChange={(date) => {
                  setFieldValue("expire_date", date?.format("YYYY/MM/DD") || "");
                }}
                format="YYYY/MM/DD"
                inputClass="w-full px-2 py-1 rounded border border-gray-300"
                inputPlaceholder="انتخاب تاریخ"
                calendarClassName="border rounded"
              />
              <ErrorMessage
                name="expire_date"
                component="div"
                className="text-red-600 text-xs"
              />

              <label htmlFor="count" className="font-semibold">
                مقدار
              </label>
              <Field
                type="number"
                name="count"
                placeholder="مقدار"
                className="w-full px-2 py-1 rounded border border-gray-300"
              />
              <ErrorMessage
                name="count"
                component="div"
                className="text-red-600 text-xs"
              />

              <label htmlFor="price" className="font-semibold">
                قیمت
              </label>
              <Field
                type="number"
                name="price"
                placeholder="قیمت"
                className="w-full px-2 py-1 rounded border border-gray-300"
              />
              <ErrorMessage
                name="price"
                component="div"
                className="text-red-600 text-xs"
              />

              <label htmlFor="description" className="font-semibold">
                توضیحات (اختیاری)
              </label>
              <Field
                as="textarea"
                name="description"
                placeholder="توضیحات (اختیاری)"
                rows={2}
                className="w-full px-2 py-1 rounded border border-gray-300"
              />

              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="bg-green-600 text-white w-full py-1 rounded hover:bg-green-700 transition"
              >
                {loading || isSubmitting ? "در حال ارسال..." : "ثبت شارژ انبار"}
              </button>

              {message && <div className="text-sm mt-1">{message}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
