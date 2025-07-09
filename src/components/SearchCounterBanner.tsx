"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SearchCounterBanner = () => {
  const [searchCount, setSearchCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("searchCount");
    setSearchCount(Number(stored) || 0);
  }, []);

  const remaining = 3 - searchCount;

  // Don’t show if user already exceeded 3
  if (remaining <= 0) return null;

  return (
    <Alert className="bg-blue-900/80 border border-blue-600 text-white shadow rounded-xl max-w-xl mx-auto my-4">
      <AlertCircle className="h-5 w-5 text-blue-300" />
      <AlertDescription>
        You have <strong>{remaining}</strong> free search{remaining !== 1 ? 'es' : ''} left.
      </AlertDescription>
    </Alert>
  );
};

export default SearchCounterBanner;
