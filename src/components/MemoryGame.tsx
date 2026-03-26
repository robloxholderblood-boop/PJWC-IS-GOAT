import React, { useState, useEffect } from 'react';

interface MemoryGameProps {
  onExit: () => void;
}

const EMOJIS = ['🎮', '🕹️', '👾', '🚀', '🛸', '🪐', '⭐', '🔥'];

export const MemoryGame: React.FC<MemoryGameProps> = ({ onExit }) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    const initialCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
    setCards(initialCards);
    setFlipped([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setFlipped([]);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const isWon = cards.length > 0 && cards.every(c => c.matched);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-white p-4">
      <div className="mb-8 flex justify-between w-full max-w-[400px]">
        <span className="text-xl font-mono">Moves: {moves}</span>
        <button onClick={onExit} className="text-zinc-400 hover:text-white transition-colors">Exit</button>
      </div>
      
      <div className="grid grid-cols-4 gap-4 max-w-[400px] w-full">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square text-4xl flex items-center justify-center rounded-xl transition-all duration-300 transform ${
              card.flipped || card.matched 
                ? 'bg-zinc-100 text-zinc-900 rotate-0' 
                : 'bg-zinc-800 text-transparent rotate-180'
            }`}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {isWon && (
        <div className="mt-8 text-center animate-bounce">
          <h2 className="text-3xl font-bold text-green-400">You Won!</h2>
          <button 
            onClick={initGame} 
            className="mt-4 px-6 py-2 bg-zinc-100 text-zinc-900 rounded-full font-bold"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
