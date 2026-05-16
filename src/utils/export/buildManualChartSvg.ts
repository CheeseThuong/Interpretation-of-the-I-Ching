import type { ManualHexagramState } from '../../types';
import { escapeXml, svgHexagram, svgTable } from './svgElements';
import { downloadFile } from './downloadFile';

// ============================================================
// BUILD SVG STRING
// ============================================================

export function buildManualChartSvg(state: ManualHexagramState): string {
  const timeText = new Date().toLocaleString('vi-VN');
  const width = 1280;
  const height = 980;

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

// ============================================================
// DOWNLOAD WRAPPERS
// ============================================================

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
