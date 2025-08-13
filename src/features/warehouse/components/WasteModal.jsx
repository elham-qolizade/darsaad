import React from "react";

export default function WasteModal({
  show,
  onClose,
  wasteForm,
  handleWasteChange,
  handleWasteSubmit,
  errors,
  loading,
  message,
  units,
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

        <form
          onSubmit={handleWasteSubmit}
          className="space-y-3 text-xs"
        >
          <label htmlFor="count" className="font-semibold">
            مقدار ضایعات
          </label>
          <input
            type="number"
            name="count"
            id="count"
            placeholder="مقدار ضایعات"
            value={wasteForm.count}
            onChange={handleWasteChange}
            className="w-full px-2 py-1 rounded border border-gray-300"
          />
          {errors.count && (
            <div className="text-red-600 text-xs">{errors.count}</div>
          )}

          <label htmlFor="unit" className="font-semibold">
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
          {errors.unit && <div className="text-red-600 text-xs">{errors.unit}</div>}

          {errors.unit && Array.isArray(errors.unit) && (
            <div className="text-red-600 text-xs mt-1">{errors.unit.join(", ")}</div>
          )}

          <label htmlFor="description" className="font-semibold">
            توضیحات (اختیاری)
          </label>
          <textarea
            name="description"
            id="description"
            placeholder="توضیحات (اختیاری)"
            rows={2}
            value={wasteForm.description}
            onChange={handleWasteChange}
            className="w-full px-2 py-1 rounded border border-gray-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white w-full py-1 rounded hover:bg-red-700 transition"
          >
            {loading ? "در حال ارسال..." : "ثبت ضایعات"}
          </button>

          {message && <div className="text-sm mt-1">{message}</div>}

          {errors.non_field_errors && errors.non_field_errors.length > 0 && (
            <div className="text-red-600 text-sm mt-2">
              {errors.non_field_errors.map((errMsg, idx) => (
                <div key={idx}>{errMsg}</div>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
