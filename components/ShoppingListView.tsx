import React, { useState, useEffect } from 'react';
import { JournalEntry, JournalCategory } from '../types';

interface ShoppingListViewProps {
  entries: JournalEntry[];
  onClose: () => void;
  onAddItem: (content: string) => void;
  onDeleteItem: (id: string) => void;
}

const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


export const ShoppingListView: React.FC<ShoppingListViewProps> = ({ entries, onClose, onAddItem, onDeleteItem }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    // Animate in on mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to finish before calling parent onClose to unmount
    setTimeout(onClose, 300);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
    }
  };

  const shoppingItems = entries.filter(
    (entry) => entry.category === JournalCategory.SHOPPING
  );

  return (
    <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity ease-in-out duration-300 ${isVisible ? 'bg-opacity-60' : 'bg-opacity-0'}`} 
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-800 text-white shadow-2xl transform transition-transform ease-in-out duration-300 flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 flex-shrink-0">
          <div className="flex items-center">
            <ShoppingCartIcon />
            <h2 className="text-lg font-bold">Shopping List</h2>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-700" aria-label="Close shopping list">
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {shoppingItems.length > 0 ? (
            <ul className="space-y-3">
              {shoppingItems.map((item) => (
                <li key={item.id} className="bg-gray-700 p-3 rounded-lg flex items-center shadow-md">
                    <span className="flex-1 text-gray-200">{item.content}</span>
                    <button 
                      onClick={() => onDeleteItem(item.id)}
                      className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-600 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete ${item.content}`}
                    >
                      <TrashIcon />
                    </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="mt-4 text-lg">Your shopping list is empty.</p>
              <p className="text-sm text-center mt-2">Try adding an item like:<br/><code className="bg-gray-700 px-1 rounded">Add milk to my shopping list</code></p>
            </div>
          )}
        </div>
        <footer className="p-4 border-t border-gray-700 bg-gray-900">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add a new item..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newItem.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-md px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
            >
              Add
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
