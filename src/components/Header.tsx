import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-cyan-400">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
        <span className="text-gray-300">NomaRoot</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
          Beta Test
        </span>
        <Button variant="ghost" size="sm" className="text-gray-400">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Header;