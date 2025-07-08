import React from "react";
import { TrashIcon, ArrowRightOnRectangleIcon, GlobeAltIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

const Settings: React.FC = () => {
  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all shortened links? This action cannot be undone.")) {
      alert("All data deleted (mock).");
    }
  };

  const handleLogout = () => {
    alert("Logged out (mock).");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">⚙️ Settings</h2>

      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <AdjustmentsHorizontalIcon className="w-6 h-6 text-blue-500" />
          <span className="font-medium text-gray-800">Theme</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <GlobeAltIcon className="w-6 h-6 text-green-500" />
          <span className="font-medium text-gray-800">Language</span>
        </div>
        <select className="bg-white border border-gray-300 rounded px-3 py-1 text-gray-800">
          <option>English</option>
          <option>Vietnamese</option>
        </select>
      </div>

      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <TrashIcon className="w-6 h-6 text-red-500" />
          <span className="font-medium text-gray-800">Delete all data</span>
        </div>
        <button
          onClick={handleDeleteAll}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>

      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-800">Logout</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );

};

export default Settings;
