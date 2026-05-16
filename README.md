# Kinh Dịch AI — Lục Hào & Tử Vi Tool

Ứng dụng web hỗ trợ tra cứu, lập quẻ Kinh Dịch (Lục Hào) và tham khảo Tử Vi / Bát Tự theo phương pháp truyền thống. Được xây dựng bằng **React + TypeScript + Vite**.

> ⚠️ Đây là công cụ phản tư và tham khảo văn hoá. Không thay thế chuyên gia trong pháp lý, y tế, tài chính hoặc an toàn cá nhân.

---

## Tính năng hiện tại

| Tính năng | Trạng thái | Ghi chú |
|---|---|---|
| Lập quẻ thủ công (Lục Hào) | ✅ Hoạt động | Nhập 6/7/8/9, tính quẻ chính / quẻ hỗ / quẻ biến |
| Validation 6 hào | ✅ Hoạt động | Throw lỗi nếu input sai, hiển thị error cho user |
| Nạp giáp / Lục Thần | ✅ Hoạt động | Tính Can Chi, Lục Thân, Lục Thú theo Thiên Can ngày |
| Quẻ hỗ (Nuclear hexagram) | ✅ Hoạt động | Hào 2-3-4 (hạ) và 3-4-5 (thượng) |
| Xuất hình PNG / SVG | ✅ Hoạt động | Build client-side, không cần server |
| AI Oracle Reading | 🟡 Mock | Dùng hash deterministc, chưa kết nối AI thật |
| Decision Scorer | 🟡 Mock | Scoring bằng keyword, không phải AI |
| Dữ liệu 64 quẻ (diễn giải) | 🔴 Một phần | Có 3 quẻ mẫu, còn 61 quẻ TODO |
| Bát Tự (Tứ Trụ) | 🔴 TODO | Cần lịch vạn niên + thuật toán Can Chi ngày |
| Tử Vi (An sao) | 🔴 TODO | Cần thuật toán an sao đầy đủ |
| Cơ sở dữ liệu 384 hào | 🔴 TODO | Mỗi hào cần: nghĩa gốc, lời khuyên, cảnh báo |
| AI luận giải | 🔴 TODO | Cần kết nối LLM API + RAG trên 64 quẻ / 384 hào |

---

## Cấu trúc thư mục

```
src/
├── components/
│   ├── sections/          # Các section trang chủ
│   │   ├── CoinSection.tsx      # Lập quẻ thủ công (UI chính)
│   │   ├── ReadingSection.tsx   # Oracle reading (mock)
│   │   ├── DecisionSection.tsx  # Decision scorer (mock)
│   │   ├── DataSection.tsx      # Giới thiệu data layer
│   │   ├── FoundationSection.tsx
│   │   ├── GallerySection.tsx
│   │   └── HeroSection.tsx
│   ├── ui/
│   │   ├── HexagramDisplay.tsx  # Vẽ quẻ (6 hào SVG-like)
│   │   └── GalleryModal.tsx     # Modal gallery
│   ├── Header.tsx
│   └── Footer.tsx
│
├── data/
│   ├── hexagrams.ts       # 64 quẻ + cung họ + nạp giáp + selfResponseByStage
│   ├── hexagramsFull.ts   # Diễn giải đầy đủ (HexagramFull) — 3/64 quẻ có data
│   ├── trigrams.ts        # 8 quái cơ bản
│   ├── canchi.ts          # Thiên Can, Địa Chi, Lục Thú, ngũ hành Chi
│   ├── shared.ts          # coinLineOptions, dataSources, gallery, decisionKeywords
│   ├── battu.ts           # Dữ liệu Bát Tự (cấu trúc có, thuật toán TODO)
│   └── tuvi.ts            # Dữ liệu Tử Vi (cấu trúc có, thuật toán TODO)
│
├── hooks/
│   ├── useManualHexagram.ts  # State + validation + error cho CoinSection
│   ├── useReading.ts         # Oracle reading hook (mock)
│   └── useScrollEffects.ts   # Scroll reveal + active nav
│
├── types/
│   └── index.ts           # Tất cả TypeScript interfaces/types
│
├── utils/
│   ├── hexagram.ts        # Logic lập quẻ, validation, nuclear hexagram
│   ├── decision.ts        # Scoring lựa chọn
│   └── export/
│       ├── index.ts             # Barrel export
│       ├── downloadFile.ts      # Browser download helper
│       ├── svgElements.ts       # SVG primitives (escapeXml, svgLine, svgTable)
│       └── buildManualChartSvg.ts  # Build + download PNG/SVG chart
│
└── styles/
    └── index.css          # CSS duy nhất của project
```

---

## Cài đặt & Chạy

### Yêu cầu
- Node.js ≥ 18
- npm ≥ 9

### Cài package
```bash
npm ci
```

### Dev server
```bash
npm run dev
# → http://localhost:5173
```

### Build production
```bash
npm run build
# Output: dist/
```

### Preview build
```bash
npm run preview
```

---

## Kiểm tra code

```bash
# TypeScript strict check (cả tsconfig.app.json + tsconfig.node.json)
npm run typecheck

# ESLint
npm run lint

# Unit tests (Vitest)
npm run test:run   # chạy một lần
npm run test       # watch mode

# Coverage
npm run coverage
```

---

## Logic lập quẻ (Lục Hào)

### Thứ tự nhập hào
- **Hào 1** = dưới cùng (index 0 trong array)
- **Hào 6** = trên cùng (index 5 trong array)
- Form hiển thị từ hào 6 xuống hào 1 để dễ hình dung quẻ

### Giá trị hợp lệ
| Giá trị | Tên | Trạng thái |
|---|---|---|
| 6 | Lão Âm | Âm động → đổi thành Dương |
| 7 | Thiếu Dương | Dương tĩnh |
| 8 | Thiếu Âm | Âm tĩnh |
| 9 | Lão Dương | Dương động → đổi thành Âm |

### Quẻ hỗ (Nuclear hexagram)
- Hạ quái: hào 2, 3, 4
- Thượng quái: hào 3, 4, 5

---

## TODO rõ ràng

### Bát Tự (Tứ Trụ / Four Pillars)
- Cần thuật toán đổi lịch Dương → Âm (lịch vạn niên)
- Cần bảng tra tháng lệnh chính xác theo tiết khí
- Cần tính Giờ trụ theo kinh độ địa phương
- File: `src/data/battu.ts`, `src/types/index.ts` (comment TODO dòng ~200)

### Tử Vi
- Cần thuật toán an sao đầy đủ (Tử Vi, Thiên Phủ, các phụ tinh)
- Cần bảng cung an theo Can Chi năm sinh
- File: `src/data/tuvi.ts`

### Dữ liệu 64 quẻ đầy đủ
- Hiện có 3 quẻ mẫu trong `src/data/hexagramsFull.ts`
- Cần bổ sung 61 quẻ còn lại với đủ: `judgment`, `image`, `keywords`, `overallMeaning`, `workMeaning`, `loveMeaning`, `financeMeaning`, `healthNote`, 6 `lines`

### Dữ liệu 384 hào
- Mỗi hào cần: `originalText`, `translationVi`, `modernAdvice`, `warning`, `reflectionQuestion`
- Tương đương 384 entries → nên lưu từng file JSON hoặc database

### AI luận giải
- Cần kết nối LLM API (OpenAI / Gemini / Anthropic)
- Cần RAG trên corpus 64 quẻ + 384 hào
- Cần prompt engineering cho luận quẻ theo ngữ cảnh

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Vanilla CSS (`src/styles/index.css`) |
| Testing | Vitest 4 |
| Linting | ESLint 10 + typescript-eslint |
| Export | Canvas API (PNG), Blob (SVG) |

---

## License

Dữ liệu Kinh Dịch gốc (cổ văn) là public domain.  
Code project: MIT.
