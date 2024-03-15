export const mapObjectValues = <T, U>(
  input: Record<string, T>,
  mapper: (value: T) => U,
): Record<string, U> =>
  Object.fromEntries(Object.entries(input).map(([key, value]) => [key, mapper(value)]));

export const mapPresentObjectValues = <T, U>(
  input: Record<string, T | null | undefined>,
  mapper: (value: T) => U,
): Record<string, U> =>
  Object.fromEntries(
    Object.entries(input).flatMap(([key, value]) => (value != null ? [[key, mapper(value)]] : [])),
  );

export const indexBy = <T, K extends keyof T>(
  items: ReadonlyArray<T>,
  keyProperty: K,
): Record<string, T> =>
  Object.fromEntries(items.map((item): [string, T] => [String(item[keyProperty]), item]));

export const isNotNull = <T>(value: T | null | undefined): value is T => value != null;

export type ResultOrError<T> = { ok: true; result: T } | { ok: false; error: string };

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const kebabCaseToTitleCase = (variableName: string, prefix?: string) => {
  if (prefix && variableName.startsWith(prefix)) {
    variableName = variableName.substring(prefix.length);
  }
  return variableName.replaceAll('-', ' ').replace(/(?:^|\W)+\w/g, (match) => match.toUpperCase());
};

export const logErrorMessage = (message: string, error?: unknown) => {
  if (error) {
    // eslint-disable-next-line no-console
    console.error(message, error);
  } else {
    // eslint-disable-next-line no-console
    console.error(message);
  }
};

export const assertNotNull = <T>(value: T | null | undefined): T => {
  if (value == null) throw new Error('Expected non-null value');
  return value;
};
