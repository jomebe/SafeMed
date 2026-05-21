# SafeMed Frontend

SafeMed는 복용 중인 여러 의약품을 선택하고 개인 특성을 입력하면 약물 조합의 위험도를 확인할 수 있는 공공 보건형 의약품 안전 리포트 프론트엔드 프로토타입입니다.

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
npm run dev
```

## Run backend

```bash
npm run backend
```

기본 주소:

```text
http://localhost:4000
```

프론트엔드에서 백엔드를 붙여 테스트:

```bash
$env:VITE_API_BASE_URL="http://localhost:4000"; npm run dev
```

API:

- `GET /health`
- `GET /medicines?query=메트포르민`
- `POST /analyze`

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
│   ├── data.js
│   └── server.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── lib/
    │   ├── mockData.ts
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

## Mock data

프론트엔드와 백엔드는 같은 목 데이터와 분석 규칙을 사용합니다.

포함된 예시 의약품은 암로디핀, 메트포르민, 시메티딘, 이부프로펜, 아세트아미노펜, 코데인, 와파린, 아스피린, 로수바스타틴, 오메프라졸입니다.

목 분석은 병용 위험, 임부 주의, 고령자 주의 조건을 계산합니다. 위험 점수는 데모용이며 실제 의학적 판단에 사용할 수 없습니다.

## Future backend API connection

`VITE_API_BASE_URL` 환경 변수를 설정하면 목 분석 대신 외부 API 호출 준비 로직을 사용합니다.

예시:

```bash
VITE_API_BASE_URL=https://api.example.com npm run dev
```

준비된 함수:

- `searchMedicines(query)`
- `analyzeMedicines(payload)`

백엔드가 없는 경우에는 자동으로 목 데이터 분석을 사용합니다.

## Disclaimer

본 서비스는 의학적 진단이나 처방을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.
