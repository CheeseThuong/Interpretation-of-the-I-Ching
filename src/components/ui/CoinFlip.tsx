import React from 'react';

interface CoinFlipProps {
  faces: number[]; // Array of 3 numbers: 2 (Yin/Tails) or 3 (Yang/Heads)
  isFlipping: boolean;
  flipId: number; // Used to restart CSS animations
}

const CoinFlip: React.FC<CoinFlipProps> = ({ faces, isFlipping, flipId }) => {
  // If faces array isn't populated yet, we default to Yang (3) for the initial render
  const safeFaces = faces.length === 3 ? faces : [3, 3, 3];

  return (
    <div className="coin-flip-container">
      {[0, 1, 2].map((idx) => {
        const isYang = safeFaces[idx] === 3;
        const animationClass = isFlipping
          ? (isYang ? 'flipping-yang' : 'flipping-yin')
          : (faces.length === 3 ? (isYang ? 'show-yang' : 'show-yin') : 'show-yang');

        return (
          <div key={idx} className="coin-3d-wrapper">
            <div 
              key={`${flipId}-${idx}`} 
              className={`coin-3d ${animationClass}`} 
              style={{ animationDelay: isFlipping ? `${idx * 0.1}s` : '0s' }}
            >
              <div className="coin-face coin-face-front">
                <span className="coin-text">陽</span>
                <span className="coin-subtext">3</span>
              </div>
              <div className="coin-face coin-face-back">
                <span className="coin-text">陰</span>
                <span className="coin-subtext">2</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CoinFlip;
