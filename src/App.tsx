/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Search, 
  TrendingUp, 
  Clock, 
  Star, 
  LayoutGrid, 
  Ghost, 
  Trophy,
  X,
  Play
} from 'lucide-react';
import { MemoryGame } from './components/MemoryGame';
import { SnakeGame } from './components/SnakeGame';

interface Game {
  id: string;
  title: string;
  category: string;
  image: string;
  rating: number;
  plays: string;
  embedUrl?: string;
  component?: React.ReactNode;
}

const GAMES: Game[] = [
  {
    id: 'memory',
    title: 'Emoji Match',
    category: 'Puzzle',
    image: 'https://i.postimg.cc/k6m0M68N/emoji-match.png',
    rating: 4.8,
    plays: '850K',
  },
  {
    id: '1v1',
    title: '1v1.lol',
    category: 'Action',
    image: 'https://i.postimg.cc/nXn9m0xc/1v1.png',
    rating: 4.7,
    plays: '1.2M',
    embedUrl: 'https://classroom4x.dev/1v1/'
  },
  {
    id: 'dadish',
    title: 'Dadish',
    category: 'Arcade',
    image: 'https://i.postimg.cc/3ysvk7Jv/dadish.png',
    rating: 4.9,
    plays: '420K',
    embedUrl: 'https://lgames.techgrapple.com/file/h5games/onlinegames/games/2023/q2/dadish/index.html'
  },
  {
    id: 'snake',
    title: 'Snake Classic',
    category: 'Arcade',
    image: 'https://i.postimg.cc/VSC3qBms/snake.png',
    rating: 4.8,
    plays: '2.1M',
  }
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const categories = ['All', 'Action', 'Arcade', 'Puzzle', 'Strategy'];

  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderActiveGame = () => {
    const game = GAMES.find(g => g.id === activeGame);
    
    if (game?.embedUrl) {
      return (
        <div className="w-full h-full bg-black flex flex-col">
          <iframe 
            id="innerFrame"
            name="innerFrame"
            src={game.embedUrl} 
            className="flex-1 w-full border-none"
            allowFullScreen
            title={game.title}
            sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads allow-storage-access-by-user-activation"
            style={{ overflow: 'auto' }}
          />
          <div className="p-4 bg-zinc-900 flex justify-between items-center text-xs text-zinc-500">
            <span>Powered by Classroom4x</span>
            <div className="flex gap-4">
              <button onClick={() => window.open(game.embedUrl, '_blank')} className="hover:text-white transition-colors">Open in New Tab</button>
              <button onClick={() => document.querySelector('iframe')?.requestFullscreen()} className="hover:text-white transition-colors">Fullscreen</button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeGame) {
      case 'memory':
        return <MemoryGame onExit={() => setActiveGame(null)} />;
      case 'snake':
        return <SnakeGame onExit={() => setActiveGame(null)} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <Ghost size={64} className="mb-4 opacity-20" />
            <p className="text-xl">Game not found...</p>
            <button 
              onClick={() => setActiveGame(null)}
              className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
            >
              Go Back
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Gamepad2 className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">NEXUS<span className="text-indigo-500">GAMES</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#" className="hover:text-white transition-colors">Trending</a>
            <a href="#" className="hover:text-white transition-colors">New</a>
            <a href="#" className="hover:text-white transition-colors">Categories</a>
          </div>

          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!activeGame && (
          <section className="mb-12">
            <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden group">
              <img 
                src="https://i.postimg.cc/nXn9m0xc/1v1.png" 
                alt="Featured" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full">Featured</span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold">4.9</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight uppercase">1V1.LOL</h1>
                <p className="text-zinc-300 max-w-lg mb-6 line-clamp-2">Build, edit, and shoot in this intense competitive battle royale. Can you be the last one standing?</p>
                <button 
                  onClick={() => setActiveGame('1v1')}
                  className="px-8 py-4 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-indigo-500 hover:text-white transition-all transform active:scale-95"
                >
                  <Play size={20} fill="currentColor" />
                  PLAY NOW
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Game Area */}
        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div 
              key="game-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[60] bg-[#09090b] flex flex-col"
            >
              <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="text-indigo-500" />
                  <span className="font-bold">{GAMES.find(g => g.id === activeGame)?.title}</span>
                </div>
                <button 
                  onClick={() => setActiveGame(null)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1">
                {renderActiveGame()}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Categories */}
              <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Game Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={game.image} 
                        alt={game.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => setActiveGame(game.id)}
                          className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform shadow-xl"
                        >
                          <Play size={24} fill="currentColor" />
                        </button>
                      </div>
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-zinc-300">
                        {game.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{game.title}</h3>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs font-bold">{game.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          <span>{game.plays} plays</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Updated</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="py-20 text-center">
                  <Ghost size={48} className="mx-auto mb-4 text-zinc-700" />
                  <h3 className="text-xl font-medium text-zinc-500">No games found matching your search</h3>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-20 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight">NEXUS<span className="text-indigo-500">GAMES</span></span>
            </div>
            <p className="text-zinc-500 max-w-sm leading-relaxed">
              The ultimate destination for unblocked web games. Play the best arcade, action, and puzzle games directly in your browser.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-zinc-200">Quick Links</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-zinc-200">Follow Us</h4>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                <Ghost size={20} />
              </div>
              <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                <Trophy size={20} />
              </div>
              <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                <LayoutGrid size={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-zinc-900 text-center text-zinc-600 text-xs">
          © 2026 Nexus Games. All rights reserved. Built with passion for gamers.
        </div>
      </footer>
    </div>
  );
}
