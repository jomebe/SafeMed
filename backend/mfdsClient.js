const EASY_DRUG_URL =
  'https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

export function hasMfdsServiceKey() {
  return Boolean(getMfdsServiceKey());
}

export async function searchMfdsMedicines(query = '') {
  requireMfdsServiceKey();

  const data = await fetchMfds(EASY_DRUG_URL, {
    itemName: query.trim(),
    pageNo: '1',
    numOfRows: query.trim() ? '20' : '10',
    type: 'json',
  });

  return getItems(data).map(toMedicine);
}

export async function getMfdsMedicineById(itemSeq) {
  requireMfdsServiceKey();

  const data = await fetchMfds(EASY_DRUG_URL, {
    itemSeq,
    pageNo: '1',
    numOfRows: '1',
    type: 'json',
  });

  return getItems(data).map(toMedicineDetail)[0] ?? null;
}

function requireMfdsServiceKey() {
  if (!getMfdsServiceKey()) {
    const error = new Error('MFDS_SERVICE_KEY 환경변수가 필요합니다.');
    error.statusCode = 503;
    throw error;
  }
}

async function fetchMfds(endpoint, params) {
  const url = new URL(endpoint);
  url.searchParams.set('serviceKey', getMfdsServiceKey());

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw mfdsError(response.status, text);
  }

  try {
    const data = JSON.parse(text);
    const header = data?.body?.header ?? data?.header;
    const resultCode = header?.resultCode;

    if (resultCode && resultCode !== '00') {
      throw mfdsError(502, header?.resultMsg ?? 'MFDS API error');
    }

    return data;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw mfdsError(502, 'MFDS API 응답을 해석할 수 없습니다.');
  }
}

function getItems(data) {
  const item = data?.body?.items?.item ?? data?.body?.items ?? [];

  if (!item) {
    return [];
  }

  return Array.isArray(item) ? item : [item];
}

function toMedicine(item) {
  return {
    id: String(item.itemSeq ?? ''),
    name: cleanText(item.itemName),
    ingredientName: cleanText(item.efcyQesitm),
    ingredientCode: String(item.itemSeq ?? ''),
    category: '의약품',
    company: cleanText(item.entpName),
    description: cleanText(item.efcyQesitm),
  };
}

function toMedicineDetail(item) {
  return {
    ...toMedicine(item),
    useMethod: cleanText(item.useMethodQesitm),
    warning: cleanText([item.atpnWarnQesitm, item.atpnQesitm].filter(Boolean).join('\n')),
    interaction: cleanText(item.intrcQesitm),
    sideEffect: cleanText(item.seQesitm),
    storage: cleanText(item.depositMethodQesitm),
    imageUrl: cleanText(item.itemImage),
    sourceUpdatedAt: cleanText(item.updateDe),
  };
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mfdsError(statusCode, message) {
  const error = new Error(message || 'MFDS API request failed');
  error.statusCode = statusCode;
  return error;
}

function getMfdsServiceKey() {
  return process.env.MFDS_SERVICE_KEY ?? process.env.DATA_GO_KR_SERVICE_KEY ?? '';
}
