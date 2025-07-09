import React from 'react';

interface SearchCounterProps {
  count: number;
  isLoggedIn: boolean;
  onLimitReached: () => void;
}

const SearchCounter: React.FC<SearchCounterProps> = ({ 
  count, 
  isLoggedIn, 
  onLimitReached 
}) => {
  React.useEffect(() => {
    if (!isLoggedIn && count >= 3) {
      onLimitReached();
    }
  }, [count, isLoggedIn, onLimitReached]);

  if (isLoggedIn) return null;
  
  const remaining = 3 - count;
  return (
    <div className="text-center text-sm text-gray-400 mb-4">
      {remaining > 0 ? (
        <p>You have {remaining} free search{remaining !== 1 ? 'es' : ''} remaining</p>
      ) : (
        <p className="text-red-400">Please login to continue searching</p>
      )}
    </div>
  );
};

export default SearchCounter;