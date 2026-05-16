import type { LineType, Trigram, Hexagram, LineDetail, ManualHexagramState, CoinLineOption } from '../types';
import { trigramByBits } from '../data/trigrams';
import { HEXAGRAMS, palaceSequences, palaceElements, palaceStageNames, selfResponseByStage, najia } from '../data/hexagrams';
import { branchElements, beastOrder, beastStartByDayStem } from '../data/canchi';
import { coinLineOptions } from '../data/shared';

// ============================================================
// INDEX LOOKUPS
// ============================================================

/** hexagram lookup by 6-bit code string (lower+upper) */
const hexagramByCode: Record<string, Hexagram> = {};
/** hexagram lookup by King Wen number */
const hexagramByNo: Record<number, Hexagram> = {};

HEXAGRAMS.forEach((hex) => {
  const code = hex.lower + hex.upper;
  const entry: Hexagram = { ...hex, code };
  hexagramByCode[code] = entry;
  hexagramByNo[hex.no] = entry;
});

// Attach palace info
Object.entries(palaceSequences).forEach(([palace, sequence]) => {
  sequence.forEach((hexNo, index) => {
    if (hexagramByNo[hexNo]) {
      hexagramByNo[hexNo].palace = palace;
      hexagramByNo[hexNo].palaceElement = palaceElements[palace];
      hexagramByNo[hexNo].palaceStage = palaceStageNames[index];
    }
  });
});

// ============================================================
// BASIC HELPERS
// ============================================================

/** Simple FNV-1a hash — deterministic "random" from strings */
export function hashText(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

export function bitsFromLineTypes(lines: LineType[]): string {
  return lines.map((l) => (l === 'yang' ? '1' : '0')).join('');
}

export function getTrigramFromLines(lines: LineType[]): Trigram {
  const key = bitsFromLineTypes(lines);
  return trigramByBits[key] ?? trigramByBits['000'];
}

export function getHexInfoFromLines(lines: LineType[]): Hexagram {
  const code = bitsFromLineTypes(lines);
  if (hexagramByCode[code]) return hexagramByCode[code];

  // Fallback if not found (should not happen with valid 6 lines)
  const fallbackLower = getTrigramFromLines(lines.slice(0, 3));
  const fallbackUpper = getTrigramFromLines(lines.slice(3, 6));
  return {
    no: 0,
    name: `${fallbackUpper.name} trên ${fallbackLower.name}`,
    upper: bitsFromLineTypes(lines.slice(3, 6)),
    lower: bitsFromLineTypes(lines.slice(0, 3)),
    code,
    palace: 'Chưa xác định',
    palaceElement: '-',
    palaceStage: '-',
  };
}

/** Build 6 yin/yang lines from a numeric seed */
export function buildLinesFromSeed(seed: number): LineType[] {
  return Array.from({ length: 6 }, (_, i) => {
    const v = (seed >> (i * 3)) & 7;
    return v % 2 === 0 ? 'yang' : 'yin';
  });
}

// ============================================================
// NAJIA / PALACE LOGIC
// ============================================================

function getBranchFromCanChi(canChi: string): string {
  return canChi.split(' ')[1] ?? '';
}

function getRelation(palaceElement: string, branchElement: string): string {
  const generates: Record<string, string> = { Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim', Kim: 'Thủy', Thủy: 'Mộc' };
  const controls: Record<string, string> = { Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim', Kim: 'Mộc' };

  if (branchElement === palaceElement) return 'Huynh Đệ';
  if (generates[branchElement] === palaceElement) return 'Phụ Mẫu';
  if (generates[palaceElement] === branchElement) return 'Tử Tôn';
  if (controls[palaceElement] === branchElement) return 'Thê Tài';
  if (controls[branchElement] === palaceElement) return 'Quan Quỷ';
  return '-';
}

function getSixBeasts(dayStem: string): string[] {
  const start = beastStartByDayStem[dayStem] ?? 0;
  return Array.from({ length: 6 }, (_, i) => beastOrder[(start + i) % beastOrder.length]);
}

function getNajiaLines(lowerBits: string, upperBits: string): string[] {
  const lower = najia[lowerBits]?.inner ?? ['-', '-', '-'];
  const upper = najia[upperBits]?.outer ?? ['-', '-', '-'];
  return [...lower, ...upper];
}

export function buildLineDetails(
  lines: LineType[],
  hexInfo: Hexagram,
  movingLineNumbers: number[],
  dayStem: string,
): LineDetail[] {
  const lowerBits = bitsFromLineTypes(lines.slice(0, 3));
  const upperBits = bitsFromLineTypes(lines.slice(3, 6));
  const canChiLines = getNajiaLines(lowerBits, upperBits);
  const beasts = getSixBeasts(dayStem);
  const palaceElement = hexInfo.palaceElement ?? '-';

  return lines.map((lineType, index): LineDetail => {
    const lineNo = index + 1;
    const canChi = canChiLines[index] ?? '-';
    const branch = getBranchFromCanChi(canChi);
    const branchElement = branchElements[branch] ?? '-';

    type SelfResponsePosition = {
      self: number;
      response: number;
    };

    const selfResponse: SelfResponsePosition =
      selfResponseByStage[hexInfo.palaceStage ?? ''] ?? {
        self: 0,
        response: 0,
      };

    let selfOrResponse = '-';

    if (selfResponse.self === lineNo) {
      selfOrResponse = 'Thế';
    } else if (selfResponse.response === lineNo) {
      selfOrResponse = 'Ứng';
    }

    return {
      lineNo,
      lineType,
      moving: movingLineNumbers.includes(lineNo),
      selfOrResponse,
      lucThan: getRelation(palaceElement, branchElement),
      canChi: branchElement !== '-' ? `${canChi}-${branchElement}` : canChi,
      lucThu: beasts[index] ?? '-',
    };
  });
}

// ============================================================
// MANUAL HEXAGRAM STATE
// ============================================================

/** Default 6 coin values matching Lôi Hỏa Phong → Lôi Sơn Tiểu Quá */
export const DEFAULT_COIN_LINES: number[] = [9, 8, 7, 7, 8, 8];

export function computeManualHexagramState(
  coinLines: number[],
  dayStem: string,
  manualQuestion: string,
): ManualHexagramState {
  const lineObjects: CoinLineOption[] = coinLines.map(
    (v) => coinLineOptions.find((o) => o.value === Number(v)) ?? coinLineOptions[2],
  );

  const primaryLines = lineObjects.map((l) => l.type);
  const changedLines = lineObjects.map((l) => l.changingTo);
  const movingLines = lineObjects
    .map((l, i) => (l.type !== l.changingTo ? i + 1 : null))
    .filter((n): n is number => n !== null);

  const lower = getTrigramFromLines(primaryLines.slice(0, 3));
  const upper = getTrigramFromLines(primaryLines.slice(3, 6));
  const changedLower = getTrigramFromLines(changedLines.slice(0, 3));
  const changedUpper = getTrigramFromLines(changedLines.slice(3, 6));

  const primaryInfo = getHexInfoFromLines(primaryLines);
  const changedInfo = getHexInfoFromLines(changedLines);

  return {
    dayStem,
    manualQuestion,
    lineObjects,
    primaryLines,
    changedLines,
    movingLines,
    lower,
    upper,
    changedLower,
    changedUpper,
    primaryInfo,
    changedInfo,
    primaryDetails: buildLineDetails(primaryLines, primaryInfo, movingLines, dayStem),
    changedDetails: buildLineDetails(changedLines, changedInfo, movingLines, dayStem),
  };
}

// ============================================================
// SVG / DOWNLOAD HELPERS
// ============================================================

function escapeXml(value: string | number): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function svgLine(x: number, y: number, type: LineType, isMoving = false): string {
  const color = isMoving ? '#d71920' : '#111111';
  const stroke = `stroke="${color}" stroke-width="10" stroke-linecap="round"`;
  if (type === 'yang') return `<line x1="${x}" y1="${y}" x2="${x + 160}" y2="${y}" ${stroke}/>`;
  return `
    <line x1="${x}" y1="${y}" x2="${x + 62}" y2="${y}" ${stroke}/>
    <line x1="${x + 98}" y1="${y}" x2="${x + 160}" y2="${y}" ${stroke}/>
  `;
}

function svgHexagram(x: number, y: number, lines: LineType[], movingLines: number[] = []): string {
  return [...lines].reverse().map((lineType, ri) => {
    const lineNo = 6 - ri;
    return svgLine(x, y + ri * 28, lineType, movingLines.includes(lineNo));
  }).join('');
}

function svgTable(x: number, y: number, title: string, details: LineDetail[]): string {
  const colWidths = [52, 78, 70, 116, 132, 108];
  const rowHeight = 34;
  const tableWidth = colWidths.reduce((s, v) => s + v, 0);
  const headers = ['Hào', 'Dòng', 'T/Ứ', 'Lục Thân', 'Can Chi', 'Lục Thú'];
  let svg = '';

  svg += `<rect x="${x}" y="${y}" width="${tableWidth}" height="42" fill="#fff1cc" stroke="#d9c99c"/>`;
  svg += `<text x="${x + tableWidth / 2}" y="${y + 28}" text-anchor="middle" font-size="21" font-weight="800" fill="#7c4300">${escapeXml(title)}</text>`;

  let headerY = y + 42;
  let cx = x;
  headers.forEach((h, i) => {
    svg += `<rect x="${cx}" y="${headerY}" width="${colWidths[i]}" height="${rowHeight}" fill="#fff8e5" stroke="#d9c99c"/>`;
    svg += `<text x="${cx + colWidths[i] / 2}" y="${headerY + 23}" text-anchor="middle" font-size="16" font-weight="800" fill="#111">${escapeXml(h)}</text>`;
    cx += colWidths[i];
  });

  [...details].reverse().forEach((item, ri) => {
    const rowY = headerY + rowHeight * (ri + 1);
    const rowColor = item.moving ? '#d71920' : '#111111';
    const values = [item.lineNo, item.lineType === 'yang' ? '━━' : '━  ━', item.selfOrResponse, item.lucThan, item.canChi, item.lucThu];
    cx = x;
    values.forEach((v, ci) => {
      svg += `<rect x="${cx}" y="${rowY}" width="${colWidths[ci]}" height="${rowHeight}" fill="#fffdf5" stroke="#d9c99c"/>`;
      svg += `<text x="${cx + colWidths[ci] / 2}" y="${rowY + 23}" text-anchor="middle" font-size="15" fill="${rowColor}" font-weight="${item.moving ? '800' : '500'}">${escapeXml(v)}</text>`;
      cx += colWidths[ci];
    });
  });

  return svg;
}

export function buildManualChartSvg(state: ManualHexagramState): string {
  const timeText = new Date().toLocaleString('vi-VN');
  const width = 1280, height = 980;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <pattern id="paper" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M0 80 C20 40 60 40 80 0" fill="none" stroke="#f1e8ce" stroke-width="1"/>
      <path d="M0 0 C20 40 60 40 80 80" fill="none" stroke="#f6edd6" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" rx="18" fill="#fffdf2"/>
  <rect width="${width}" height="${height}" fill="url(#paper)" opacity=".75"/>
  <text x="28" y="46" font-size="24" font-weight="900" fill="#b66b00" font-family="Arial, sans-serif">KINH DỊCH AI FREE</text>
  <text x="28" y="80" font-size="19" fill="#111" font-family="Arial, sans-serif">Phương pháp lập quẻ: Lục Hào · Gieo đồng xu ngoài đời</text>
  <text x="28" y="110" font-size="19" fill="#111" font-family="Arial, sans-serif">Việc cần xem: ${escapeXml(state.manualQuestion)}</text>
  <text x="28" y="140" font-size="19" fill="#111" font-family="Arial, sans-serif">Thời gian: ${escapeXml(timeText)} · Thiên can ngày: ${escapeXml(state.dayStem)}</text>
  <line x1="24" y1="165" x2="1256" y2="165" stroke="#aaa" stroke-width="2"/>
  <text x="320" y="210" text-anchor="middle" font-size="30" font-weight="900" fill="#d71920" font-family="Arial, sans-serif">${escapeXml(state.primaryInfo.name.toUpperCase())}</text>
  <text x="320" y="465" text-anchor="middle" font-size="21" font-weight="800" fill="#444" font-family="Arial, sans-serif">HỌ ${escapeXml((state.primaryInfo.palace ?? '').toUpperCase())} · ${escapeXml((state.primaryInfo.palaceStage ?? '').toUpperCase())}</text>
  <g>${svgHexagram(240, 245, state.primaryLines, state.movingLines)}</g>
  <text x="960" y="210" text-anchor="middle" font-size="30" font-weight="900" fill="#d71920" font-family="Arial, sans-serif">${escapeXml(state.changedInfo.name.toUpperCase())}</text>
  <text x="960" y="465" text-anchor="middle" font-size="21" font-weight="800" fill="#444" font-family="Arial, sans-serif">HỌ ${escapeXml((state.changedInfo.palace ?? '').toUpperCase())} · ${escapeXml((state.changedInfo.palaceStage ?? '').toUpperCase())}</text>
  <g>${svgHexagram(880, 245, state.changedLines)}</g>
  <line x1="24" y1="498" x2="1256" y2="498" stroke="#ddd" stroke-width="2"/>
  <text x="320" y="538" text-anchor="middle" font-size="24" font-weight="900" fill="#111" font-family="Arial, sans-serif">QUẺ CHÍNH · Số ${escapeXml(state.primaryInfo.no)}</text>
  <text x="960" y="538" text-anchor="middle" font-size="24" font-weight="900" fill="#111" font-family="Arial, sans-serif">QUẺ BIẾN · Số ${escapeXml(state.changedInfo.no)}</text>
  ${svgTable(48, 565, 'Lục hào quẻ chính', state.primaryDetails)}
  ${svgTable(688, 565, 'Lục hào quẻ biến', state.changedDetails)}
  <text x="28" y="945" font-size="17" fill="#555" font-family="Arial, sans-serif">Ghi chú: Bảng demo tính cung/họ, lục thân, can chi nạp giáp, lục thú theo thiên can ngày để hỗ trợ AI luận quẻ.</text>
</svg>`.trim();
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadSvg(state: ManualHexagramState): void {
  downloadFile('lap-que-luc-hao.svg', buildManualChartSvg(state), 'image/svg+xml;charset=utf-8');
}

export function downloadPng(state: ManualHexagramState): void {
  const svg = buildManualChartSvg(state);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 980;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fffdf2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = 'lap-que-luc-hao.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    downloadSvg(state);
  };

  img.src = url;
}
