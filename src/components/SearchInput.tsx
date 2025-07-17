import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder = "I'm looking for...", 
  value = "",
  onChange 
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-10 pr-4 py-2 bg-white text-gray-900 rounded-full border-0 focus:ring-2 focus:ring-cyan-400"
      />
    </div>
  );
};

export default SearchInput;