// FilterBar.tsx
import React from "react";

interface Props {
  status: string;
  setStatus: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
}

export const FilterBar: React.FC<Props> = ({ status, setStatus, date, setDate }) => {
  return (
    <div className="flex gap-4 mb-4">
      <select
        className="px-4 py-2 bg-[#121623] text-white rounded-lg border border-[#2e3446]"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <select
        className="px-4 py-2 bg-[#121623] text-white rounded-lg border border-[#2e3446]"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      >
        <option value="all">All Dates</option>
        <option value="7days">Last 7 days</option>
        <option value="thisMonth">This month</option>
      </select>
    </div>
  );
};
