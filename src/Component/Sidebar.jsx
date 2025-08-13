import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ChevronRight,
  ClipboardList,
  FileText,
  Image,
  BarChart3,
  Percent,
  Table,
  Trash2,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function SidebarIcon({ icon, className = "", onClick, title }) {
    return (
      <button
        onClick={onClick}
        title={title}
        className={`text-2xl cursor-pointer hover:scale-110 transition ${className}`}
        type="button"
      >
        {icon}
      </button>
    );
  }

  return (
    <>
      {/* دکمه باز کردن منو */}
      <button
        onClick={() => setIsOpen(true)}
        className="top-4 right-4 z-50 md:hidden w-10 h-10 flex items-center justify-center text-custom-blue fixed"
        aria-label="باز کردن منو"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* پس‌زمینه تاریک */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* منو */}
      <nav
        className={`
          fixed top-0 right-0 h-screen flex flex-col items-center bg-custom-blue sm:bg-gray-100 text-white
          py-6 gap-6 rounded-l-lg shadow-lg transition-transform duration-300 ease-in-out
          w-14 z-50
          md:translate-x-0 md:rounded-full md:shadow-none
          ${isOpen ? "translate-x-0" : "translate-x-full"} md:translate-x-0
        `}
        aria-label="ناوبری اصلی"
      >
        <div className="w-14 h-16 mt-6 rounded-full bg-custom-blue flex items-center justify-center mb-4 shadow">
          <User className="text-white w-7 h-7" />
        </div>

        <aside className="w-14 h-full sm:py-12 bg-custom-blue flex flex-col items-center py-6 gap-6 rounded-full">
          <SidebarIcon icon={<ChevronRight />} title="پیش‌فرض" />
          <SidebarIcon icon={<ClipboardList />} title="لیست وظایف" />
          <SidebarIcon icon={<FileText />} title="اسناد" />
          <SidebarIcon
            icon={<Image />}
            className="cursor-pointer"
            onClick={() => navigate("/warehouse")}
            title="انبار"
          />
          <SidebarIcon icon={<BarChart3 />} title="نمودار" />
          <SidebarIcon icon={<Percent />} title="درصد" />
          <SidebarIcon icon={<Table />} title="جدول" />
          <SidebarIcon icon={<Trash2 />} className="mt-auto mb-4" title="حذف" />
        </aside>

        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 left-4 md:hidden text-white"
            aria-label="بستن منو"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </nav>
    </>
  );
}
