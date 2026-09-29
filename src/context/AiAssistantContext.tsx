import React, { createContext, useContext, useState } from 'react';

/**
 * Clean architectural integration point for future AI Business Assistant.
 * Designed so that when AI Chat is enabled in future releases, it can be docked
 * floating on bottom-right or panel side drawer without modifying main page structure.
 */

interface AiAssistantContextType {
  isAiAvailable: boolean;
  isAiDrawerOpen: boolean;
  openAiAssistant: (contextPrompt?: string) => void;
  closeAiAssistant: () => void;
}

const AiAssistantContext = createContext<AiAssistantContextType>({
  isAiAvailable: false,
  isAiDrawerOpen: false,
  openAiAssistant: () => {},
  closeAiAssistant: () => {}
});

export const AiAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const openAiAssistant = (_contextPrompt?: string) => {
    setIsAiDrawerOpen(true);
  };

  const closeAiAssistant = () => {
    setIsAiDrawerOpen(false);
  };

  return (
    <AiAssistantContext.Provider value={{
      isAiAvailable: false, // Set to true when AI model server is hooked
      isAiDrawerOpen,
      openAiAssistant,
      closeAiAssistant
    }}>
      {children}
    </AiAssistantContext.Provider>
  );
};

export const useAiAssistant = () => useContext(AiAssistantContext);
