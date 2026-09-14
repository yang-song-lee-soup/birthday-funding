export const getSearchParams = <T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
): T => {
  const result = {} as Record<string, string | number>;

  for (const [key, value] of searchParams.entries()) {
    result[key] = parseSearchParamValue(value);
  }

  return result as T;
};

function parseSearchParamValue(value: string): string | number {
  const trimmed = value.trim();

  if (trimmed !== "" && /^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}
