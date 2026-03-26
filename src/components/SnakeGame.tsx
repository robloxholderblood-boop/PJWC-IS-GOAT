import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, X, Play, Pause } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = 'UP';

export function SnakeGame({ onExit }: { onExit: () => void }) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food spawned on snake
      const onSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused || !gameStarted) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 1;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, gameStarted, generateFood, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && direction !== 'DOWN') setDirection('UP');
      if ((key === 'arrowdown' || key === 's') && direction !== 'UP') setDirection('DOWN');
      if ((key === 'arrowleft' || key === 'a') && direction !== 'RIGHT') setDirection('LEFT');
      if ((key === 'arrowright' || key === 'd') && direction !== 'LEFT') setDirection('RIGHT');
      if (key === ' ') setIsPaused(p => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameStarted && !isGameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, 150);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, isGameOver, isPaused, moveSnake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 5, y: 5 });
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#4a752c] p-4 font-sans select-none">
      {/* Header */}
      <div className="w-full max-w-[500px] flex items-center justify-between bg-[#4a752c] mb-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#3a5d23] px-4 py-2 rounded-lg">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
            <span className="font-bold text-xl">{score}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#3a5d23] px-4 py-2 rounded-lg">
            <Trophy size={20} className="text-yellow-400" />
            <span className="font-bold text-xl">{highScore}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-[#3a5d23] hover:bg-[#2d481b] rounded-lg transition-colors"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          <button 
            onClick={onExit}
            className="p-2 bg-[#3a5d23] hover:bg-[#2d481b] rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div 
        className="relative bg-[#aad751] border-8 border-[#3a5d23] rounded-sm shadow-2xl overflow-hidden"
        style={{ 
          width: 'min(90vw, 500px)', 
          height: 'min(90vw, 500px)',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {/* Checkerboard pattern */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isDark = (x + y) % 2 === 1;
          return (
            <div 
              key={i} 
              className={isDark ? 'bg-[#a2d149]' : 'bg-[#aad751]'}
            />
          );
        })}

        {/* Food */}
        <div 
          className="absolute flex items-center justify-center"
          style={{
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
          }}
        >
          <div className="w-4/5 h-4/5 bg-red-500 rounded-full shadow-lg" />
        </div>

        {/* Snake */}
        {snake.map((segment, i) => {
          const isHead = i === 0;
          return (
            <div 
              key={i}
              className="absolute flex items-center justify-center transition-all duration-150"
              style={{
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                zIndex: isHead ? 10 : 5,
              }}
            >
              <div 
                className={`w-full h-full ${isHead ? 'bg-[#4e7cf6]' : 'bg-[#4e7cf6]/80'} rounded-sm flex items-center justify-center`}
              >
                {isHead && (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Overlays */}
        <AnimatePresence>
          {!gameStarted && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            >
              <h2 className="text-4xl font-black text-white mb-8 drop-shadow-lg">SNAKE</h2>
              <button 
                onClick={() => setGameStarted(true)}
                className="group px-12 py-4 bg-[#4e7cf6] text-white rounded-full font-bold text-xl flex items-center gap-3 hover:bg-[#3b60c4] transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              >
                <Play fill="currentColor" />
                START GAME
              </button>
              <p className="mt-6 text-white/80 text-sm font-medium">Use ARROWS or WASD to move</p>
            </motion.div>
          )}

          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-30"
            >
              <h2 className="text-5xl font-black text-white mb-2 tracking-tight">GAME OVER</h2>
              <p className="text-white/60 mb-8 text-xl font-medium">Final Score: {score}</p>
              <div className="flex gap-4">
                <button 
                  onClick={resetGame}
                  className="px-8 py-3 bg-[#4e7cf6] text-white rounded-full font-bold flex items-center gap-2 hover:bg-[#3b60c4] transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <RotateCcw size={20} />
                  TRY AGAIN
                </button>
                <button 
                  onClick={onExit}
                  className="px-8 py-3 bg-zinc-800 text-white rounded-full font-bold flex items-center gap-2 hover:bg-zinc-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <X size={20} />
                  EXIT
                </button>
              </div>
            </motion.div>
          )}

          {isPaused && !isGameOver && gameStarted && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            >
              <h2 className="text-4xl font-black text-white mb-8">PAUSED</h2>
              <button 
                onClick={() => setIsPaused(false)}
                className="px-12 py-4 bg-[#4e7cf6] text-white rounded-full font-bold text-xl flex items-center gap-3 hover:bg-[#3b60c4] transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              >
                <Play fill="currentColor" />
                RESUME
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Help */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-white/40 text-xs font-bold uppercase tracking-widest">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">W</div>
          </div>
          <div className="flex gap-1">
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">A</div>
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">S</div>
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">D</div>
          </div>
          <span className="mt-1">WASD</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">↑</div>
          </div>
          <div className="flex gap-1">
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">←</div>
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">↓</div>
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center">→</div>
          </div>
          <span className="mt-1">ARROWS</span>
        </div>
      </div>
    </div>
  );
}
