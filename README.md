# SafeMed

SafeMed는 복용 중인 여러 의약품을 선택하고 개인 특성을 입력하면 백엔드 API로 약물 조합의 위험도를 확인하는 공공 보건형 의약품 안전 리포트 프로토타입입니다.

이 저장소는 프론트엔드와 로컬 테스트용 Node.js 백엔드를 포함합니다. 데이터베이스와 ML 코드는 포함하지 않습니다.

## Tech stack

- React
- TypeScript
- Vite
- TailwindCSS
- lucide-react
- Node.js built-in HTTP server

## Install

```bash
npm install
```

## Run dev server

```bash
npm run backend
npm run dev
```

## Run backend

```bash
$env:MFDS_SERVICE_KEY="공공데이터포털_인증키"
npm run backend
```

기본 주소:

```text
http://localhost:4000
```

프론트엔드는 기본으로 `http://localhost:4000` 백엔드를 호출합니다. 다른 서버를 붙일 때만 설정합니다.

```bash
$env:VITE_API_BASE_URL="http://localhost:4000"; npm run dev
```

API:

- `GET /health`
- `GET /medicines?query=메트포르민`
- `POST /analyze`

`MFDS_SERVICE_KEY`가 없으면 백엔드는 실제 의약품 데이터를 반환하지 않고 503 오류를 냅니다.

## Build

```bash
npm run build
```

## Project structure

```text
SafeMed/
├── package.json
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── backend/
│   ├── analysis.js
│   ├── mfdsClient.js
│   └── server.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── lib/
    │   ├── api.ts
    │   └── types.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── Hero.tsx
    │   ├── MedicineSearch.tsx
    │   ├── SelectedMedicineList.tsx
    │   ├── ProfileForm.tsx
    │   ├── AnalyzeButton.tsx
    │   ├── ResultDashboard.tsx
    │   ├── RiskGauge.tsx
    │   ├── RiskBreakdown.tsx
    │   ├── ReportSection.tsx
    │   ├── DrugDetailCard.tsx
    │   ├── AccessibilityControls.tsx
    │   └── TTSButton.tsx
    └── styles/
```

## Backend data

프론트엔드와 안드로이드 앱은 로컬 약물 데이터나 로컬 분석 함수를 사용하지 않습니다. 검색과 분석은 백엔드 API에서만 실행됩니다.

백엔드는 공공데이터포털의 식품의약품안전처 `DrbEasyDrugInfoService`를 호출합니다.

사용 데이터:

- 제품명, 업체명, 효능, 복용법
- 상호작용 주의사항
- 복용 전 주의사항

위험 점수는 식약처 제공 문구를 앱 화면에 맞게 요약하기 위한 참고값이며 실제 의학적 판단에 사용할 수 없습니다.

## API connection

웹은 기본으로 `http://localhost:4000`을 사용합니다. 환경별 주소가 필요하면 `VITE_API_BASE_URL`을 설정합니다.

예시:

```bash
VITE_API_BASE_URL=https://api.example.com npm run dev
```

준비된 함수:

- `searchMedicines(query)`
- `analyzeMedicines(payload)`

## Disclaimer

본 서비스는 의학적 진단이나 처방을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.
