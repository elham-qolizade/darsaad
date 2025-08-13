import React, { useState } from "react";

export default function AddCategoryModal({ token, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [englishTitle, setEnglishTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave({
        title,
        english_title: englishTitle || null, 
      });
      setTitle("");
      setEnglishTitle("");
    } catch (err) {
      setError("خطا در افزودن دسته‌بندی");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96 rtl text-right"
      >
        <h3 className="text-lg font-bold mb-4">افزودن دسته‌بندی جدید</h3>

        <label className="block mb-2 font-semibold">عنوان فارسی</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded w-full p-2 mb-4"
        />

        <label className="block mb-2 font-semibold">عنوان انگلیسی</label>
        <input
          type="text"
          value={englishTitle}
          onChange={(e) => setEnglishTitle(e.target.value)}
          className="border rounded w-full p-2 mb-4"
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400"
            disabled={loading}
          >
            لغو
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>
      </form>
    </div>
  );
}
