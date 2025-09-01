import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

const loadingMessages = [
  "Acessando site...",
  "Extraindo dados...",
  "Analisando credenciais...",
  "Compilando resultados...",
  "Finalizando busca..."
];

export const MatrixLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentMessage = loadingMessages[messageIndex];
    
    if (charIndex < currentMessage.length) {
      const timer = setTimeout(() => {
        setDisplayText(currentMessage.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        setCharIndex(0);
        setDisplayText('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [charIndex, messageIndex]);

  return (
    <Card className="glass p-12 border border-border bg-black/90 relative overflow-hidden">
      <div className="flex flex-col items-center space-y-8 relative z-10">
        {/* Matrix Background */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, col) => (
            <div
              key={col}
              className="absolute top-0 w-1 h-full"
              style={{ left: `${col * 5}%` }}
            >
              {Array.from({ length: 50 }).map((_, row) => (
                <div
                  key={row}
                  className="text-green-400 text-xs font-mono animate-pulse"
                  style={{
                    position: 'absolute',
                    top: `${row * 20}px`,
                    animationDelay: `${(col + row) * 0.1}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                >
                  {Math.random() > 0.5 ? '1' : '0'}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Central Matrix Animation */}
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-2 border-green-500/50 rounded-lg animate-pulse bg-green-500/5"></div>
          <div className="absolute inset-2 border border-green-400/70 rounded animate-[spin_3s_linear_infinite] bg-green-400/5"></div>
          <div className="absolute inset-4 border border-green-300/90 rounded-sm animate-[spin_2s_linear_infinite_reverse] bg-green-300/5"></div>
          <div className="absolute inset-6 bg-green-500/30 rounded-full animate-pulse"></div>
          
          {/* Matrix code rain */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent"
                style={{
                  left: `${i * 12.5}%`,
                  animation: `matrix-fall ${2 + i * 0.3}s linear infinite`,
                  animationDelay: `${i * 0.4}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <div className="h-8 flex items-center justify-center">
            <span className="text-xl font-mono text-green-400 relative drop-shadow-lg">
              {displayText}
              <span className="animate-pulse ml-1 text-green-300">|</span>
            </span>
          </div>
          
          <div className="flex space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg shadow-green-400/50"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        <p className="text-sm text-green-300/80 text-center max-w-md font-mono">
          Nossa IA está trabalhando para encontrar os melhores resultados para você...
        </p>
      </div>

    </Card>
  );
};