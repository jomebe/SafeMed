import { medicineCatalog, nsaidIds, pairRules, pregnantCautionIds } from './data.js';

export function searchMedicines(query = '') {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return medicineCatalog;
  }

  return medicineCatalog.filter((medicine) => {
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

export function analyzeMedicines(payload) {
  const medicines = normalizeMedicines(payload?.medicines);
  const profile = normalizeProfile(payload?.profile);
  const selectedIds = new Set(medicines.map((medicine) => medicine.id));
  const findings = [];

  pairRules.forEach((rule) => {
    const [firstId, secondId] = rule.medicineIds;

    if (selectedIds.has(firstId) && selectedIds.has(secondId)) {
      const matchedMedicines = medicines.filter(
        (medicine) => medicine.id === firstId || medicine.id === secondId,
      );

      findings.push({
        id: `${firstId}-${secondId}`,
        severity: rule.severity,
        title: rule.severity === 'danger' ? '즉시 확인이 필요한 조합' : '주의가 필요한 조합',
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

  if (profile.age >= 65 && selectedIds.has('ibuprofen')) {
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

  return {
    riskScore,
    riskLevel,
    findings,
    safeCombinations: getSafeCombinations(medicines, findings),
    scoreBreakdown,
    summary: getSummary(findings, riskLevel),
  };
}

function normalizeMedicines(medicines) {
  if (!Array.isArray(medicines)) {
    return [];
  }

  const knownById = new Map(medicineCatalog.map((medicine) => [medicine.id, medicine]));

  return medicines
    .map((medicine) => knownById.get(medicine?.id))
    .filter(Boolean);
}

function normalizeProfile(profile) {
  const age = Number(profile?.age);

  return {
    age: Number.isFinite(age) ? age : 0,
    sex: ['male', 'female', 'other'].includes(profile?.sex) ? profile.sex : 'other',
    pregnant: Boolean(profile?.pregnant),
  };
}

function getScoreBreakdown(findings, medicines, profile) {
  const danger = findings.filter((finding) => finding.severity === 'danger').length * 35;
  const warning = findings.filter((finding) => finding.severity === 'warning').length * 18;
  const info = findings.filter((finding) => finding.severity === 'info').length * 7;
  const selectedIds = new Set(medicines.map((medicine) => medicine.id));
  const hasNsaid = medicines.some((medicine) => nsaidIds.has(medicine.id));
  let profileScore = 0;

  if (profile.age >= 65 && hasNsaid) {
    profileScore += 5;
  }

  if (profile.pregnant && [...pregnantCautionIds].some((medicineId) => selectedIds.has(medicineId))) {
    profileScore += 15;
  }

  return { danger, warning, profile: profileScore, info };
}

function getSafeCombinations(medicines, findings) {
  const riskyPairKeys = new Set(
    findings
      .filter((finding) => finding.medicines.length >= 2)
      .map((finding) => makePairKey(finding.medicines.map((medicine) => medicine.id))),
  );
  const safeCombinations = [];

  medicines.forEach((firstMedicine, firstIndex) => {
    medicines.slice(firstIndex + 1).forEach((secondMedicine) => {
      const pairKey = makePairKey([firstMedicine.id, secondMedicine.id]);

      if (!riskyPairKeys.has(pairKey)) {
        safeCombinations.push({
          id: pairKey,
          medicines: [firstMedicine, secondMedicine],
          summary: '현재 백엔드 기준으로 별도 위험 신호가 확인되지 않았습니다.',
        });
      }
    });
  });

  return safeCombinations;
}

function makePairKey(ids) {
  return [...ids].sort().join('__');
}

function getRiskLevel(score) {
  if (score <= 30) {
    return 'safe';
  }

  if (score <= 60) {
    return 'caution';
  }

  return 'danger';
}

function getSummary(findings, riskLevel) {
  const firstDanger = findings.find((finding) => finding.severity === 'danger');

  if (firstDanger) {
    const names = firstDanger.medicines.map((medicine) => medicine.name).join('과 ');
    return `현재 선택한 약 중 일부는 함께 복용할 때 위험할 수 있어요. 특히 ${names} 조합은 전문가 상담이 필요해요.`;
  }

  if (riskLevel === 'caution') {
    return '현재 선택한 약에서 주의가 필요한 신호가 있어요. 복용 전 의사나 약사에게 확인해 주세요.';
  }

  return '현재 백엔드 기준으로 큰 위험 신호는 확인되지 않았어요. 그래도 복약 결정은 전문가와 상담해 주세요.';
}
