import React from 'react';
import { Card } from '@/components/ui/card';

interface SuggestionCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ title, description, onClick }) => {
  return (
    <Card 
      className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <h3 className="text-sm font-medium text-white mb-2">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      <div className="mt-3">
        <span className="text-xs text-cyan-400 hover:text-cyan-300">Ask this →</span>
      </div>
    </Card>
  );
};

export default SuggestionCard;