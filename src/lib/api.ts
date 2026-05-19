import { analyzeMockMedicines, searchMockMedicines } from './mockData';
import type { AnalysisPayload, AnalysisResult, Medicine } from './types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

export async function searchMedicines(query: string): Promise<Medicine[]> {
  if (!apiBaseUrl) {
    return searchMockMedicines(query);
  }

  const response = await fetch(
    `${apiBaseUrl}/medicines?query=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error('의약품 검색에 실패했습니다.');
  }

  return response.json() as Promise<Medicine[]>;
}

export async function analyzeMedicines(
  payload: AnalysisPayload,
): Promise<AnalysisResult> {
  if (!apiBaseUrl) {
    return analyzeMockMedicines(payload);
  }

  const response = await fetch(`${apiBaseUrl}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('안전성 분석에 실패했습니다.');
  }

  return response.json() as Promise<AnalysisResult>;
}
