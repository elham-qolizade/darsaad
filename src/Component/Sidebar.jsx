import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronRight, ClipboardList, FileText, Image, BarChart3, Percent, Table, Trash2 } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function SidebarIcon({ icon, className, onClick }) {
    return (
      <div
        onClick={onClick}
        className={`text-2xl cursor-pointer hover:scale-110 transition ${className}`}
      >
        {icon}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className=" top-4 left-4 z-50 md:hidden w-10 h-10 flex items-center justify-center text-custom-blue"
        aria-label="باز کردن منو"
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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`
          fixed top-0 sm:mr-2 sm:ms-2 left-0 h-screen flex flex-col items-center bg-custom-blue sm:bg-gray-100  text-white
          py-6 gap-6 rounded-r-lg shadow-lg transition-transform duration-300 ease-in-out
          w-14 z-50
          md:translate-x-0 md:rounded-full md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <div className="w-14 h-16 mt-6 rounded-full bg-custom-blue flex items-center justify-center mb-4 shadow">
          <User className="text-white w-7 h-7" />
        </div>

        <aside className="w-14 h-full sm:py-12 bg-custom-blue flex flex-col items-center py-6 gap-6 rounded-full">
          <SidebarIcon icon={<ChevronRight />} />
          <SidebarIcon icon={<ClipboardList />} />
          <SidebarIcon icon={<FileText />} />
          <SidebarIcon
            icon={<Image />}
            className="cursor-pointer"
            onClick={() => navigate("/warehouse")}
          />
          <SidebarIcon icon={<BarChart3 />} />
          <SidebarIcon icon={<Percent />} />
          <SidebarIcon icon={<Table />} />
          <SidebarIcon icon={<Trash2 />} className="mt-auto mb-4" />
        </aside>

        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 md:hidden text-white"
            aria-label="بستن منو"
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
      </div>
    </>
  );
}
