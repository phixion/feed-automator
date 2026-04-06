import './index.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Settings } from './components/Settings';

export const App = () => {
  const [view, setView] = useState<'home' | 'settings'>('home');

  if (view === 'settings') {
    return (
      <div>
        <button
          onClick={() => setView('home')}
          className="fixed top-4 left-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back
        </button>
        <Settings />
      </div>
    );
  }

  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4 bg-white dark:bg-gray-900">
      <img
        className="object-contain w-1/2 max-w-[250px] mx-auto"
        src="/snoo.png"
        alt="Snoo"
      />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          Feed Automator
        </h1>
        <p className="text-base text-center text-gray-600 dark:text-gray-300">
          Automatically post content from RSS feeds to your subreddit
        </p>
      </div>
      <button
        onClick={() => setView('settings')}
        className="mt-8 px-6 py-3 bg-[#d93900] dark:bg-orange-600 text-white rounded-lg hover:bg-[#c23300] dark:hover:bg-orange-700 font-semibold transition-colors"
      >
        Manage Feeds
      </button>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
