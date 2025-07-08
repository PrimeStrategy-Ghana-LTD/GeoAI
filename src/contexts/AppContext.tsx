import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  currentView: 'home' | 'chat';
  setCurrentView: (view: 'home' | 'chat') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');

  return (
    <AppContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </AppContext.Provider>
  );
};