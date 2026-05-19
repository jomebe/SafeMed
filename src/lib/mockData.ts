import type {
  AnalysisPayload,
  AnalysisResult,
  Medicine,
  RiskFinding,
  RiskLevel,
  SafeCombination,
  Severity,
} from './types';

export const mockMedicines: Medicine[] = [
  {
    id: 'amlodipine',
    name: '암로디핀',
    ingredientName: 'Amlodipine',
    ingredientCode: 'ING-AML-001',
    category: '혈압약',
    company: '세이프제약',
    description: '고혈압과 협심증 치료에 사용되는 칼슘채널차단제입니다.',
  },
  {
    id: 'metformin',
    name: '메트포르민',
    ingredientName: 'Metformin',
    ingredientCode: 'ING-MET-002',
    category: '당뇨약',
    company: '건강팜',
    description: '제2형 당뇨병에서 혈당 조절을 돕는 약입니다.',
  },
  {
    id: 'cimetidine',
    name: '시메티딘',
    ingredientName: 'Cimetidine',
    ingredientCode: 'ING-CIM-003',
    category: '위장약',
    company: '메디케어',
    description: '위산 분비를 줄이는 H2 수용체 길항제입니다.',
  },
  {
    id: 'ibuprofen',
    name: '이부프로펜',
    ingredientName: 'Ibuprofen',
    ingredientCode: 'ING-IBU-004',
    category: '소염진통제',
    company: '바른약품',
    description: '통증과 염증을 줄이는 비스테로이드성 소염진통제입니다.',
  },
  {
    id: 'acetaminophen',
    name: '아세트아미노펜',
    ingredientName: 'Acetaminophen',
    ingredientCode: 'ING-ACE-005',
    category: '해열진통제',
    company: '해피헬스',
    description: '발열과 통증 완화에 사용되는 해열진통제입니다.',
  },
  {
    id: 'codeine',
    name: '코데인',
    ingredientName: 'Codeine',
    ingredientCode: 'ING-COD-006',
    category: '진해진통제',
    company: '케어랩',
    description: '기침 억제와 통증 완화에 사용되는 성분입니다.',
  },
  {
    id: 'warfarin',
    name: '와파린',
    ingredientName: 'Warfarin',
    ingredientCode: 'ING-WAR-007',
    category: '항응고제',
    company: '라이프메드',
    description: '혈전 생성을 줄이기 위해 사용하는 항응고제입니다.',
  },
  {
    id: 'aspirin',
    name: '아스피린',
    ingredientName: 'Aspirin',
    ingredientCode: 'ING-ASP-008',
    category: '항혈소판제',
    company: '온누리제약',
    description: '통증 완화와 혈소판 응집 억제에 사용되는 약입니다.',
  },
  {
    id: 'rosuvastatin',
    name: '로수바스타틴',
    ingredientName: 'Rosuvastatin',
    ingredientCode: 'ING-ROS-009',
    category: '고지혈증약',
    company: '청솔제약',
    description: '콜레스테롤 수치를 낮추는 스타틴 계열 약입니다.',
  },
  {
    id: 'omeprazole',
    name: '오메프라졸',
    ingredientName: 'Omeprazole',
    ingredientCode: 'ING-OME-010',
    category: '위장약',
    company: '케이메디',
    description: '위산 분비를 억제하는 프로톤펌프억제제입니다.',
  },
];

const pairRules: Array<{
  medicineIds: [string, string];
  severity: Severity;
  reason: string;
  source: string;
}> = [
  {
    medicineIds: ['cimetidine', 'metformin'],
    severity: 'danger',
    reason: '메트포르민 혈중 농도 상승 위험이 있어 주의가 필요합니다.',
    source: 'DUR 병용금기 데이터',
  },
  {
    medicineIds: ['warfarin', 'aspirin'],
    severity: 'danger',
    reason: '출혈 위험이 증가할 수 있습니다.',
    source: 'DUR 병용주의 데이터',
  },
  {
    medicineIds: ['ibuprofen', 'aspirin'],
    severity: 'warning',
    reason: '위장관 출혈 위험이 증가할 수 있습니다.',
    source: '노인주의 및 상호작용 데이터',
  },
];

const nsaidIds = new Set(['ibuprofen', 'aspirin']);
const pregnantCautionIds = new Set(['codeine']);

export function searchMockMedicines(query: string): Medicine[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return mockMedicines;
  }

  return mockMedicines.filter((medicine) => {
    const searchableText = [
      medicine.name,
      medicine.ingredientName,
      medicine.ingredientCode,
      medicine.category,
      medicine.company,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export async function analyzeMockMedicines(
  payload: AnalysisPayload,
): Promise<AnalysisResult> {
  await wait(700);

  const { medicines, profile } = payload;
  const selectedIds = new Set(medicines.map((medicine) => medicine.id));
  const findings: RiskFinding[] = [];

  pairRules.forEach((rule) => {
    const [firstId, secondId] = rule.medicineIds;

    if (selectedIds.has(firstId) && selectedIds.has(secondId)) {
      const matchedMedicines = medicines.filter(
        (medicine) => medicine.id === firstId || medicine.id === secondId,
      );

      findings.push({
        id: `${firstId}-${secondId}`,
        severity: rule.severity,
        title:
          rule.severity === 'danger'
            ? '즉시 확인이 필요한 조합'
            : '주의가 필요한 조합',
        medicines: matchedMedicines,
        reason: rule.reason,
        source: rule.source,
      });
    }
  });

  if (profile.pregnant && selectedIds.has('codeine')) {
    findings.push({
      id: 'pregnant-codeine',
      severity: 'danger',
      title: '임부 주의 성분',
      medicines: medicines.filter((medicine) => medicine.id === 'codeine'),
      reason: '임부에게 주의가 필요한 성분입니다.',
      source: '임부금기 데이터',
      profileRelated: true,
    });
  }

  const ageNumber = typeof profile.age === 'number' ? profile.age : 0;

  if (ageNumber >= 65 && selectedIds.has('ibuprofen')) {
    findings.push({
      id: 'senior-ibuprofen',
      severity: 'warning',
      title: '고령자 주의 성분',
      medicines: medicines.filter((medicine) => medicine.id === 'ibuprofen'),
      reason: '고령자에게 위장관 출혈 위험이 증가할 수 있습니다.',
      source: '노인주의약물 데이터',
      profileRelated: true,
    });
  }

  if (medicines.length >= 4) {
    findings.push({
      id: 'polypharmacy-info',
      severity: 'info',
      title: '다중 약물 복용 참고',
      medicines,
      reason: '선택한 약물이 4개 이상입니다. 복용 시간과 중복 성분을 함께 확인하면 좋습니다.',
      source: 'SafeMed 데모 참고 신호',
    });
  }

  const scoreBreakdown = getScoreBreakdown(findings, medicines, profile);
  const rawScore =
    scoreBreakdown.danger +
    scoreBreakdown.warning +
    scoreBreakdown.profile +
    scoreBreakdown.info;
  const riskScore = Math.min(100, rawScore);
  const riskLevel = getRiskLevel(riskScore);
  const safeCombinations = getSafeCombinations(medicines, findings);

  return {
    riskScore,
    riskLevel,
    findings,
    safeCombinations,
    scoreBreakdown,
    summary: getSummary(findings, riskLevel),
  };
}

function getScoreBreakdown(
  findings: RiskFinding[],
  medicines: Medicine[],
  profile: AnalysisPayload['profile'],
) {
  const danger = findings.filter((finding) => finding.severity === 'danger').length * 35;
  const warning = findings.filter((finding) => finding.severity === 'warning').length * 18;
  const info = findings.filter((finding) => finding.severity === 'info').length * 7;
  const selectedIds = new Set(medicines.map((medicine) => medicine.id));
  const hasNsaid = medicines.some((medicine) => nsaidIds.has(medicine.id));
  let profileScore = 0;

  if (typeof profile.age === 'number' && profile.age >= 65 && hasNsaid) {
    profileScore += 5;
  }

  if (
    profile.pregnant &&
    [...pregnantCautionIds].some((medicineId) => selectedIds.has(medicineId))
  ) {
    profileScore += 15;
  }

  return {
    danger,
    warning,
    profile: profileScore,
    info,
  };
}

function getSafeCombinations(
  medicines: Medicine[],
  findings: RiskFinding[],
): SafeCombination[] {
  const riskyPairKeys = new Set(
    findings
      .filter((finding) => finding.medicines.length >= 2)
      .map((finding) => makePairKey(finding.medicines.map((medicine) => medicine.id))),
  );
  const safeCombinations: SafeCombination[] = [];

  medicines.forEach((firstMedicine, firstIndex) => {
    medicines.slice(firstIndex + 1).forEach((secondMedicine) => {
      const pairKey = makePairKey([firstMedicine.id, secondMedicine.id]);

      if (!riskyPairKeys.has(pairKey)) {
        safeCombinations.push({
          id: pairKey,
          medicines: [firstMedicine, secondMedicine],
          summary: '현재 목 데이터 기준으로 별도 위험 신호가 확인되지 않았습니다.',
        });
      }
    });
  });

  return safeCombinations;
}

function makePairKey(ids: string[]): string {
  return [...ids].sort().join('__');
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) {
    return 'safe';
  }

  if (score <= 60) {
    return 'caution';
  }

  return 'danger';
}

function getSummary(findings: RiskFinding[], riskLevel: RiskLevel): string {
  const firstDanger = findings.find((finding) => finding.severity === 'danger');

  if (firstDanger) {
    const names = firstDanger.medicines.map((medicine) => medicine.name).join('과 ');
    return `현재 선택한 약 중 일부는 함께 복용할 때 위험할 수 있어요. 특히 ${names} 조합은 전문가 상담이 필요해요.`;
  }

  if (riskLevel === 'caution') {
    return '현재 선택한 약에서 주의가 필요한 신호가 있어요. 복용 전 의사나 약사에게 확인해 주세요.';
  }

  return '현재 목 데이터 기준으로 큰 위험 신호는 확인되지 않았어요. 그래도 복약 결정은 전문가와 상담해 주세요.';
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}
