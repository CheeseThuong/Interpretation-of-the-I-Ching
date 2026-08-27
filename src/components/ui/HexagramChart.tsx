import React from 'react';
import type { ManualHexagramState, LineType, LineDetail, HexagramFull } from '../../types';
import { cn } from '@/lib/utils';

// Premium on-screen hexagram visual, adapted from the SVG language already
// proven in src/utils/export/svgElements.ts + buildManualChartSvg.ts (which
// were previously only used for file export, never shown on-screen).

interface HexagramLineStackProps {
  lines: LineType[];
  movingLines?: number[];
}

const HexagramLineStack: React.FC<HexagramLineStackProps> = ({ lines, movingLines = [] }) => {
  const ordered = [...lines].reverse(); // hào 6 (top) → hào 1 (bottom)
  return (
    <div className="flex flex-col items-center gap-2.5 py-3">
      {ordered.map((type, ri) => {
        const lineNo = 6 - ri;
        const isMoving = movingLines.includes(lineNo);
        const barClass = isMoving ? 'bg-[#d71920] shadow-[0_0_10px_rgba(215,25,32,0.6)]' : 'bg-foreground/60';
        return (
          <div key={lineNo} className="flex w-full max-w-[220px] items-center gap-3">
            <span className="w-4 shrink-0 text-right text-[0.7rem] text-muted-foreground">{lineNo}</span>
            {type === 'yang' ? (
              <div className={cn('h-2.5 flex-1 rounded-full', barClass)} />
            ) : (
              <div className="flex flex-1 gap-2.5">
                <div className={cn('h-2.5 flex-1 rounded-full', barClass)} />
                <div className={cn('h-2.5 flex-1 rounded-full', barClass)} />
              </div>
            )}
            <span className={cn('w-10 shrink-0 text-[0.65rem] font-bold text-[#d71920]', !isMoving && 'invisible')}>động</span>
          </div>
        );
      })}
    </div>
  );
};

const LucHaoTable: React.FC<{ title: string; details: LineDetail[] }> = ({ title, details }) => (
  <div className="mt-4 overflow-x-auto rounded-xl border border-border">
    <table className="w-full min-w-[420px] text-left text-[0.78rem]">
      <caption className="bg-card-soft px-3 py-2 text-center font-bold text-gold-soft">{title}</caption>
      <thead>
        <tr className="bg-card-soft text-muted-foreground">
          {['Hào', 'Dòng', 'T/Ứ', 'Lục Thân', 'Can Chi', 'Lục Thú'].map((h) => (
            <th key={h} className="border-t border-border px-2 py-1.5 font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...details].reverse().map((item) => (
          <tr key={item.lineNo} className={cn('border-t border-border/60', item.moving && 'font-bold text-[#d71920]')}>
            <td className="px-2 py-1.5">{item.lineNo}</td>
            <td className="px-2 py-1.5">{item.lineType === 'yang' ? '━━' : '━  ━'}</td>
            <td className="px-2 py-1.5">{item.selfOrResponse}</td>
            <td className="px-2 py-1.5">{item.lucThan}</td>
            <td className="px-2 py-1.5">{item.canChi}</td>
            <td className="px-2 py-1.5">{item.lucThu}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface HexagramChartProps {
  state: ManualHexagramState;
  primaryFull?: HexagramFull;
  changedFull?: HexagramFull;
  showDetailTables?: boolean;
}

export const HexagramChart: React.FC<HexagramChartProps> = ({
  state,
  primaryFull,
  changedFull,
  showDetailTables = true,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Quẻ Chính */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-gold">
          Quẻ Chính · Số {state.primaryInfo.no}
        </p>
        <h3 className="mt-1 font-heading text-2xl text-gold-soft">
          {primaryFull?.symbol ? `${primaryFull.symbol} ` : ''}
          {state.primaryInfo.name}
        </h3>
        {(state.primaryInfo.palace || state.primaryInfo.palaceStage) && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Họ {state.primaryInfo.palace} · {state.primaryInfo.palaceStage}
          </p>
        )}
        <HexagramLineStack lines={state.primaryLines} movingLines={state.movingLines} />
        <p className="text-center text-xs text-muted-foreground">
          Hào động: {state.movingLines.length > 0 ? state.movingLines.join(', ') : 'Không có'}
        </p>
        {primaryFull?.judgment && (
          <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm leading-relaxed">
            <p><span className="font-bold text-gold-soft">Thoán từ: </span>{primaryFull.judgment}</p>
            {primaryFull.image && (
              <p><span className="font-bold text-gold-soft">Tượng: </span>{primaryFull.image}</p>
            )}
            {primaryFull.overallMeaning && (
              <p className="text-muted-foreground">{primaryFull.overallMeaning}</p>
            )}
          </div>
        )}
        {showDetailTables && <LucHaoTable title="Lục hào quẻ chính" details={state.primaryDetails} />}
      </div>

      {/* Quẻ Biến */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-[#a0b8ff]">
          Quẻ Biến · Số {state.changedInfo.no}
        </p>
        <h3 className="mt-1 font-heading text-2xl text-[#a0b8ff]">
          {changedFull?.symbol ? `${changedFull.symbol} ` : ''}
          {state.changedInfo.name}
        </h3>
        {(state.changedInfo.palace || state.changedInfo.palaceStage) && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Họ {state.changedInfo.palace} · {state.changedInfo.palaceStage}
          </p>
        )}
        <HexagramLineStack lines={state.changedLines} />
        <p className="text-center text-xs text-muted-foreground">
          {state.movingLines.length === 0 ? 'Quẻ không có hào động, giữ nguyên trạng thái.' : ' '}
        </p>
        {changedFull?.judgment && (
          <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm leading-relaxed">
            <p><span className="font-bold text-[#a0b8ff]">Thoán từ: </span>{changedFull.judgment}</p>
            {changedFull.image && (
              <p><span className="font-bold text-[#a0b8ff]">Tượng: </span>{changedFull.image}</p>
            )}
          </div>
        )}
        {showDetailTables && <LucHaoTable title="Lục hào quẻ biến" details={state.changedDetails} />}
      </div>
    </div>
  );
};

export default HexagramChart;
