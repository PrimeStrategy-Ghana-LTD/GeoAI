import React from 'react';

export const LANDAiBetaBadge = () => (
  <div className="fixed top-4 right-4 z-50">
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-4 py-2 rounded-full text-white text-sm font-bold backdrop-blur-sm animate-pulse hover:animate-none transition-all duration-300 hover:scale-105 cursor-default flex items-center gap-2 shadow-xl">
      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
      <span className="tracking-wide">BETA TEST</span>
      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
    </div>
  </div>
);