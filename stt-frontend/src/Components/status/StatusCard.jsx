import React from "react";

export default function StatusCard({ statusMsg }) {
  return (
    <section className="bg-white border-4 border-yellow-300 rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-yellow-600 mb-3 flex items-center gap-2">
        <span>💡</span> Status
      </h2>
      <div className="text-lg font-medium text-gray-700 min-h-[32px]">
        {statusMsg || "🌈 Ready to go!"}
      </div>
    </section>
  );
}
