// GoogleForm.jsx
import React from "react";

export default function GoogleForm({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2c33] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-popIn">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">Share Your Feedback</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Modal Body (Only One Scroll) */}
        <div className="flex-1 overflow-auto p-1">
          {/* Container for seamless scroll */}
          <div className="relative">

            {/* Google Form iframe - NO internal scroll */}
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSd5jMTQNL4Cxw9pB3X8BM-ShZqEjcn9kwRkTy1SvGyIzcOsSQ/viewform?embedded=true"
              width="100%"
              height="1200" // Adjust based on typical form height
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              className="block w-full rounded-lg"
              style={{
                minHeight: "1200px",
                pointerEvents: "auto", // allow interaction
                overflow: "hidden",    // prevent inner scroll
              }}
              title="Feedback Form"
            >
              Loading…
            </iframe>

            {/* Thank You Section - Stays part of same scroll flow */}
            <div className="bg-[#2b2c33] p-6 text-center border-t border-gray-700 mt-2">
              <div className="max-w-md mx-auto">
                <h4 className="text-white font-medium mb-3">Thank You for Your Feedback!</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Your input helps us improve LANDAi and provide better land information services for Ghana.
                </p>
                <p className="text-gray-400 text-xs">
                  If you can't see the submit button above, try scrolling down inside this window.
                </p>

                {/* Fallback Button */}
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="text-gray-400 text-xs mb-2">Having trouble with the form?</p>
                  <button
                    onClick={() => {
                      window.open(
                        "https://docs.google.com/forms/d/e/1FAIpQLSd5jMTQNL4Cxw9pB3X8BM-ShZqEjcn9kwRkTy1SvGyIzcOsSQ/viewform",
                        "_blank"
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom padding for smooth scroll ending */}
            <div className="h-10 bg-[#2b2c33]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}