import React from 'react';
import type { LineType } from '../../types';

interface HexLineProps {
  type: LineType;
  isMoving?: boolean;
}

const HexLine: React.FC<HexLineProps> = ({ type, isMoving = false }) => (
  <div
    className={`hex-line${isMoving ? ' moving' : ''}`}
    aria-label={type === 'yang' ? 'Hào dương' : 'Hào âm'}
  >
    {type === 'yang' ? (
      <span className="line-solid" />
    ) : (
      <>
        <span className="line-half" />
        <span className="line-half" />
      </>
    )}
    {isMoving && <span className="moving-label">động</span>}
  </div>
);

interface HexagramDisplayProps {
  lines: LineType[];
  movingLines?: number[];
  className?: string;
  ariaLabel?: string;
}

/** Renders 6 hexagram lines top-to-bottom (line 6 = top, line 1 = bottom) */
const HexagramDisplay: React.FC<HexagramDisplayProps> = ({
  lines,
  movingLines = [],
  className = '',
  ariaLabel,
}) => (
  <div
    className={`hexagram-box${className ? ` ${className}` : ''}`}
    aria-label={ariaLabel}
  >
    {[...lines].reverse().map((type, ri) => {
      const lineNo = 6 - ri;
      return <HexLine key={lineNo} type={type} isMoving={movingLines.includes(lineNo)} />;
    })}
  </div>
);

export default HexagramDisplay;
