export const API_ROOT = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

const categoryAliases: Record<string, string> = {
  'notable-achievements-and-awards': 'notable-achievements',
};

export const normalizeCategory = (category: string) => categoryAliases[category] ?? category;

export const buildFormData = <T extends Record<string, unknown>>(data: T) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const submitAchievement = async (category: string, formData: FormData) => {
  const normalizedCategory = normalizeCategory(category);
  const baseUrl = API_ROOT || '';
  const apiRoot = baseUrl ? `${baseUrl.replace(/\/api$/, '')}/api` : '';
  const endpoint = apiRoot
    ? `${apiRoot}/faculty-activities/${normalizedCategory}`
    : `/api/faculty-activities/${normalizedCategory}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error || errorBody?.message || response.statusText || 'Submission failed';
    throw new Error(message);
  }

  return response.json();
};
