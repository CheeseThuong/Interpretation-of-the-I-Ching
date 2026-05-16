import type { LineType, LineDetail } from '../../types';

// ============================================================
// XML ESCAPE
// ============================================================

export function escapeXml(value: string | number): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

// ============================================================
// SINGLE LINE ELEMENT
// ============================================================

export function svgLine(x: number, y: number, type: LineType, isMoving = false): string {
  const color = isMoving ? '#d71920' : '#111111';
  const stroke = `stroke="${color}" stroke-width="10" stroke-linecap="round"`;
  if (type === 'yang') return `<line x1="${x}" y1="${y}" x2="${x + 160}" y2="${y}" ${stroke}/>`;
  return `
    <line x1="${x}" y1="${y}" x2="${x + 62}" y2="${y}" ${stroke}/>
    <line x1="${x + 98}" y1="${y}" x2="${x + 160}" y2="${y}" ${stroke}/>
  `;
}

// ============================================================
// HEXAGRAM STACK (6 lines, drawn top → bottom = hào 6 → hào 1)
// ============================================================

export function svgHexagram(
  x: number,
  y: number,
  lines: LineType[],
  movingLines: number[] = [],
): string {
  return [...lines]
    .reverse()
    .map((lineType, ri) => {
      const lineNo = 6 - ri;
      return svgLine(x, y + ri * 28, lineType, movingLines.includes(lineNo));
    })
    .join('');
}

// ============================================================
// DETAIL TABLE
// ============================================================

const COL_WIDTHS = [52, 78, 70, 116, 132, 108] as const;
const ROW_HEIGHT = 34;
const HEADERS = ['Hào', 'Dòng', 'T/Ứ', 'Lục Thân', 'Can Chi', 'Lục Thú'];

export function svgTable(x: number, y: number, title: string, details: LineDetail[]): string {
  const tableWidth = COL_WIDTHS.reduce((s, v) => s + v, 0);
  let svg = '';

  svg += `<rect x="${x}" y="${y}" width="${tableWidth}" height="42" fill="#fff1cc" stroke="#d9c99c"/>`;
  svg += `<text x="${x + tableWidth / 2}" y="${y + 28}" text-anchor="middle" font-size="21" font-weight="800" fill="#7c4300">${escapeXml(title)}</text>`;

  const headerY = y + 42;
  let cx = x;
  HEADERS.forEach((h, i) => {
    svg += `<rect x="${cx}" y="${headerY}" width="${COL_WIDTHS[i]}" height="${ROW_HEIGHT}" fill="#fff8e5" stroke="#d9c99c"/>`;
    svg += `<text x="${cx + COL_WIDTHS[i] / 2}" y="${headerY + 23}" text-anchor="middle" font-size="16" font-weight="800" fill="#111">${escapeXml(h)}</text>`;
    cx += COL_WIDTHS[i];
  });

  [...details].reverse().forEach((item, ri) => {
    const rowY = headerY + ROW_HEIGHT * (ri + 1);
    const rowColor = item.moving ? '#d71920' : '#111111';
    const values = [
      item.lineNo,
      item.lineType === 'yang' ? '━━' : '━  ━',
      item.selfOrResponse,
      item.lucThan,
      item.canChi,
      item.lucThu,
    ];
    cx = x;
    values.forEach((v, ci) => {
      svg += `<rect x="${cx}" y="${rowY}" width="${COL_WIDTHS[ci]}" height="${ROW_HEIGHT}" fill="#fffdf5" stroke="#d9c99c"/>`;
      svg += `<text x="${cx + COL_WIDTHS[ci] / 2}" y="${rowY + 23}" text-anchor="middle" font-size="15" fill="${rowColor}" font-weight="${item.moving ? '800' : '500'}">${escapeXml(v)}</text>`;
      cx += COL_WIDTHS[ci];
    });
  });

  return svg;
}
