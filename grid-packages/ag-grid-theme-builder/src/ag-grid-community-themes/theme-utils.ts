import { AnyPart, CombinedParts, Part } from './theme-types';

/**
 * Version of Object.entries typed to allow easy iteration over objects. Callers
 * must promise that objects passed do not have any additional keys over those
 * included in the type
 */
export const typedEntries = <K extends string | number | symbol, V>(
  record: Record<K, V>,
): [K, V][] => Object.entries(record) as [K, V][];

export const colorParamToCss = (value: string | number) => {
  if (typeof value !== 'number') return value;
  const percent = Math.round(value * 1000) / 10;
  return `color-mix(in srgb, transparent, var(--ag-foreground-color) ${percent}%)`;
};

export const kebabCase = (str: string) => str.replace(/[A-Z]/g, (m) => `-${m}`).toLowerCase();

export const paramToVariableName = (paramName: string) => `--ag-${kebabCase(paramName)}`;

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const logErrorMessage = (message: unknown, error?: unknown) => {
  if (error) {
    // eslint-disable-next-line no-console
    console.error(message, error);
  } else {
    // eslint-disable-next-line no-console
    console.error(message);
  }
};

export const proportionToPercent = (value: number) =>
  Math.round(Math.max(0, Math.min(1, value)) * 1000) / 10;

export type DefinePartArgs<T extends string = string> = Omit<Part<T>, 'params'>;

export const definePart = <T extends string>(args: DefinePartArgs<T>): Part<T> => {
  const params = Object.keys(args.defaults || {});
  return {
    ...args,
    params: params as T[],
  };
};

export const camelCase = (str: string) =>
  str.replace(/[\W_]+([a-z])/g, (_, letter) => letter.toUpperCase());

export const presetParamName = (partId: string) => `${camelCase(partId)}Preset`;

export const combineParts = <P extends AnyPart>(
  parts: P[],
): CombinedParts<P['params'][number]> => ({
  params: parts.flatMap((part) => part.params),
  componentParts: parts,
});

export const borderValueToCss = (value: string | boolean) => {
  if (value === true) return 'solid 1px var(--ag-border-color)';
  if (value === false) return 'none';
  return value;
};
