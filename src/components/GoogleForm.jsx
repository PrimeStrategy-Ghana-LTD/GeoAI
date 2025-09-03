
// GoogleForm.jsx
import React from "react";

export default function GoogleForm({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2c33] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-popIn">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">Share Your Feedback</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-hidden"> {/* Changed from overflow-auto to overflow-hidden */}
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSd5jMTQNL4Cxw9pB3X8BM-ShZqEjcn9kwRkTy1SvGyIzcOsSQ/viewform?embedded=true"
            width="100%"
            height="100%" /* Changed from fixed height to 100% */
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            className="rounded-lg"
            style={{ minHeight: '600px' }} /* Added min-height for smaller screens */
          >
            Loading…
          </iframe>
        </div>
      </div>
    </div>
  );
}