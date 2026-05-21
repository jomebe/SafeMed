import { getMfdsMedicineById, searchMfdsMedicines } from './mfdsClient.js';

export async function searchMedicines(query = '') {
  return searchMfdsMedicines(query);
}

export async function analyzeMedicines(payload) {
  const medicines = Array.isArray(payload?.medicines) ? payload.medicines : [];
  const profile = normalizeProfile(payload?.profile);
  const details = (
    await Promise.all(medicines.map((medicine) => getMfdsMedicineById(medicine?.id)))
  ).filter(Boolean);

  const findings = details.flatMap((medicine) => getMedicineFindings(medicine, profile));

  if (details.length >= 4) {
    findings.push({
      id: 'polypharmacy-info',
      severity: 'info',
      title: '다중 약물 복용 참고',
      medicines: details,
      reason: '선택한 약물이 4개 이상입니다. 복용 시간과 중복 성분은 의사나 약사에게 확인해 주세요.',
      source: 'SafeMed 복약 개수 기준',
    });
  }

  const scoreBreakdown = getScoreBreakdown(findings);
  const riskScore = Math.min(
    100,
    scoreBreakdown.danger + scoreBreakdown.warning + scoreBreakdown.profile + scoreBreakdown.info,
  );
  const riskLevel = getRiskLevel(riskScore);

  return {
    riskScore,
    riskLevel,
    findings,
    safeCombinations: getSafeCombinations(details, findings),
    scoreBreakdown,
    summary: getSummary(findings, riskLevel),
  };
}

function getMedicineFindings(medicine, profile) {
  const findings = [];

  if (medicine.interaction) {
    findings.push({
      id: `${medicine.id}-interaction`,
      severity: 'warning',
      title: '상호작용 주의사항',
      medicines: [medicine],
      reason: medicine.interaction,
      source: '식품의약품안전처 e약은요 상호작용 정보',
    });
  }

  if (medicine.warning) {
    const isPregnancyWarning = profile.pregnant && /임부|임산부|임신|수유/.test(medicine.warning);
    const isSeniorWarning = profile.age >= 65 && /고령|노인|65세|고령자/.test(medicine.warning);

    if (isPregnancyWarning || isSeniorWarning) {
      findings.push({
        id: `${medicine.id}-profile-warning`,
        severity: isPregnancyWarning ? 'danger' : 'warning',
        title: isPregnancyWarning ? '임부 관련 주의사항' : '고령자 관련 주의사항',
        medicines: [medicine],
        reason: medicine.warning,
        source: '식품의약품안전처 e약은요 주의사항',
        profileRelated: true,
      });
    }
  }

  return findings;
}

function normalizeProfile(profile) {
  const age = Number(profile?.age);

  return {
    age: Number.isFinite(age) ? age : 0,
    sex: ['male', 'female', 'other'].includes(profile?.sex) ? profile.sex : 'other',
    pregnant: Boolean(profile?.pregnant),
  };
}

function getScoreBreakdown(findings) {
  return {
    danger: findings.filter((finding) => finding.severity === 'danger').length * 35,
    warning: findings.filter((finding) => finding.severity === 'warning').length * 18,
    profile: findings.filter((finding) => finding.profileRelated).length * 5,
    info: findings.filter((finding) => finding.severity === 'info').length * 7,
  };
}

function getSafeCombinations(medicines, findings) {
  if (findings.some((finding) => finding.severity === 'danger' || finding.severity === 'warning')) {
    return [];
  }

  const safeCombinations = [];

  medicines.forEach((firstMedicine, firstIndex) => {
    medicines.slice(firstIndex + 1).forEach((secondMedicine) => {
      safeCombinations.push({
        id: [firstMedicine.id, secondMedicine.id].sort().join('__'),
        medicines: [firstMedicine, secondMedicine],
        summary: '식약처 e약은요 정보 기준으로 개별 상호작용 주의 문구가 확인되지 않았습니다.',
      });
    });
  });

  return safeCombinations;
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
    return '선택한 약에서 사용자 상태와 관련된 강한 주의사항이 확인됐어요. 복용 전 의사나 약사에게 확인해 주세요.';
  }

  if (riskLevel === 'caution') {
    return '선택한 약에서 식약처 의약품 정보 기반 주의사항이 확인됐어요. 복용 전 의사나 약사에게 확인해 주세요.';
  }

  return '식약처 e약은요 정보 기준으로 큰 위험 신호는 확인되지 않았어요. 그래도 복약 결정은 전문가와 상담해 주세요.';
}
