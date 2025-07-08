import React from 'react';
import SearchInput from './SearchInput';
import SuggestionCard from './SuggestionCard';

const MainContent: React.FC = () => {
  const suggestions = [
    {
      title: "Recommend litigation free land for my gym project",
      description: "Ask this →"
    },
    {
      title: "Which area in Accra is best for building a story building",
      description: "Ask this →"
    },
    {
      title: "Which areas in Kumasi are marked as ramsa sites?",
      description: "Ask this →"
    },
    {
      title: "I want to start water sell business, which areas in Takoradi is best?",
      description: "Ask this →"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-red-400">Get all you need</span>
          <br />
          <span className="text-purple-400">about your </span>
          <span className="text-purple-400">desired </span>
          <span className="text-blue-400">land</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8">How you can I help you today?</p>
        <SearchInput />
      </div>
      
      <div className="w-full max-w-4xl">
        <p className="text-gray-400 text-center mb-6">You may ask</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              title={suggestion.title}
              description={suggestion.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainContent;