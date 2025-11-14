import React, { useState, useEffect, useRef } from "react";
import { Content } from "@google/genai";
import { JournalEntry, UIMessage, JournalCategory } from "./types";
import { processUserMessage } from "./services/vercelService";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { ShoppingListView } from "./components/ShoppingListView";

const HeaderLogo = () => (
  <div className="flex items-center gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 text-indigo-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle
        cx="12"
        cy="8"
        r="3"
        className="fill-current text-indigo-400 opacity-95"
      />
      <path
        d="M5 20c2-4 6-6 7-6s5 2 7 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="sr-only">Journal App logo</span>
  </div>
);

const HeaderCartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const App: React.FC = () => {
  const [uiMessages, setUiMessages] = useState<UIMessage[]>([
    {
      id: "init",
      role: "model",
      content:
        "Hello! I'm your personal journal assistant. How can I help you today? You can tell me things to remember, add to your shopping list, or ask me what you've saved.",
    },
  ]);
  // Fix: Chat history state must be of type `Content[]` to be compatible with the geminiService.
  const [chatHistory, setChatHistory] = useState<Content[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShoppingListVisible, setIsShoppingListVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uiMessages]);

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    setUiMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: message },
    ]);

    try {
      const { newHistory, newJournal, responseText } = await processUserMessage(
        message,
        chatHistory,
        journalEntries
      );

      setChatHistory(newHistory);
      setJournalEntries(newJournal);
      setUiMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-ai",
          role: "model",
          content: responseText,
        },
      ]);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setUiMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-err",
          role: "model",
          content: `Sorry, something went wrong: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddJournalEntry = (content: string) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      category: JournalCategory.SHOPPING,
      content,
      timestamp: new Date(),
    };
    setJournalEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== id)
    );
  };

  const shoppingItemCount = journalEntries.filter(
    (entry) => entry.category === JournalCategory.SHOPPING
  ).length;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="p-4 border-b border-gray-700 shadow-lg bg-gray-800 flex justify-between items-center z-10">
        <div className="w-8">
          <HeaderLogo />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-indigo-400">Journal App</h1>
          <p className="text-xs text-gray-400">
            Your private journaling assistant
          </p>
        </div>
        <button
          onClick={() => setIsShoppingListVisible(true)}
          className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full relative focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          aria-label={`Open shopping list (${shoppingItemCount} items)`}
        >
          <HeaderCartIcon />
          {shoppingItemCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-gray-800">
              {shoppingItemCount}
            </span>
          )}
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {uiMessages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="max-w-3xl mx-auto w-full">
        <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
      </footer>
      {isShoppingListVisible && (
        <ShoppingListView
          entries={journalEntries}
          onClose={() => setIsShoppingListVisible(false)}
          onAddItem={handleAddJournalEntry}
          onDeleteItem={handleDeleteJournalEntry}
        />
      )}
    </div>
  );
};

export default App;
