import React from 'react';
import LiveConversation from './components/LiveConversation';

const App: React.FC = () => {
  return (
    <div className="bg-[#F8BBD0] text-gray-800 min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <header className="mb-8 text-center">
        <img
          src="https://uploads.onecompiler.io/43b3fbqd5/442ycgepa/kdrama.png"
          alt="Kdrama Links Logo"
          className="w-64 h-auto mx-auto"
        />
      </header>
      <main className="w-full max-w-2xl">
        <LiveConversation />
      </main>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Developed by Kdrama links Team</p>
        <p>Total used:2,806</p>
      </footer>
    </div>
  );
};

export default App;
