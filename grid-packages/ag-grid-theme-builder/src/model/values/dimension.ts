import { logErrorMessage } from 'model/utils';

export type DimensionValue = {
  type: 'dimension';
  number: number;
  units: string;
};

export const dimension = (value: number, units: string): DimensionValue => {
  return { type: 'dimension', number: value, units };
};

const numberWithUnits = /^([\d.]+)(\w*|%)$/;
const calcExpression = /^calc\((([\d.]+(\w*|%)|[\s\d+\-*/)()]|calc)+)\)$/;

export const parseCssDimension = (css: string): DimensionValue | null => {
  css = css.toLowerCase();
  const numberMatch = css.match(numberWithUnits);
  if (numberMatch) {
    const number = parseFloat(numberMatch[1]);
    const unit = numberMatch[2];
    if (isNaN(number)) return null;
    if (!unit && number !== 0) return null;
    return dimension(number, numberMatch[2]);
  }
  const calcMatch = css.match(calcExpression);
  if (calcMatch) {
    const expression = calcMatch[0];
    const units = [...expression.matchAll(/[a-z%]+/gi)]
      .map((item) => item[0])
      .filter((unit) => unit !== 'calc');
    const unit = units[0] || '';
    if (units.find((otherUnit) => otherUnit !== unit)) return null;
    let result: unknown;
    // stripping alphanumeric characters causes a CSS calc expression like
    // `calc(calc(6px * 2) + 16px)` to become a valid mathematical expression
    // e.g. '((6 * 2) + 16)' which can be safely passed to eval
    const prepared = 'return ' + expression.replace(/[a-z%]/gi, '');
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      result = new Function(prepared)();
    } catch (e) {
      logErrorMessage(`Error evaluating expression "${expression}" as "${prepared}"`, e);
      return null;
    }
    if (typeof result !== 'number') return null;
    if (!unit && result !== 0) return null;
    return dimension(result, unit);
  }
  return null;
};

export const dimensionToCss = ({ number, units }: DimensionValue): string => number + (units || '');
