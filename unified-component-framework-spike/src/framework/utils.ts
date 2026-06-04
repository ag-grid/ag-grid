export const arrayOfValues = <T>(
  value: T | T[],
): Exclude<T, null | undefined>[] => {
  return (Array.isArray(value) ? value : [value]).filter(isNotNullish);
};

const isNotNullish = <T>(
  value: T | null | undefined,
): value is Exclude<T, null | undefined> => {
  return value != null;
};
