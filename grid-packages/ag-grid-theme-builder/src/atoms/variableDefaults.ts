import { atom, useAtomValue, useSetAtom } from 'jotai';
import { logErrorMessage } from 'model/utils';
import { Value, parseCssString } from 'model/values';
import { getVariableDefaultValue } from 'model/values/defaults';
import { getVariableInfoOrThrow } from 'model/variableInfo';
import { useCallback } from 'react';

export const useGetVariableDefault = () => {
  const valueGetter = useAtomValue(computedValueGetterAtom);

  return useCallback(
    (variableName: string) =>
      valueGetter.getComputedValue(variableName) || getVariableDefaultValue(variableName),
    [valueGetter],
  );
};

export const useResetVariableDefaults = () => {
  const set = useSetAtom(computedValueGetterAtom);
  return useCallback(() => {
    set(new ComputedValueGetter());
  }, [set]);
};

const defaultsElementId = 'theme-builder-defaults-computation';
class ComputedValueGetter {
  private cache: Record<string, Value | null | undefined> = {};

  private computedStyle?: CSSStyleDeclaration;

  getComputedValue(variableName: string): Value | null {
    const element = document.getElementById(defaultsElementId);
    if (!element) {
      throw new Error(`${ComputedValueGetter.name} created before #${defaultsElementId} element`);
    }
    const computedStyle = this.computedStyle || getComputedStyle(element);

    const cachedValue = this.cache[variableName];
    if (cachedValue !== undefined) return cachedValue;

    const info = getVariableInfoOrThrow(variableName);
    const unevaluatedValue = computedStyle.getPropertyValue(variableName);
    if (!/[()]/.test(unevaluatedValue)) {
      // values without function calls can be parsed directly
      return (this.cache[variableName] = parseCssString(info, unevaluatedValue));
    }

    // If the value contains function calls like calc() and color-mix(), we need
    // to get the browser to evaluate these into raw dimension and color values
    const evaluationProperty = evaluationProperties[info.type];
    element.style[evaluationProperty] = `var(${variableName})`;
    const cssValue = computedStyle[evaluationProperty];
    element.style[evaluationProperty] = '';
    if (!cssValue) return (this.cache[variableName] = null);
    const parsedValue = parseCssString(info, String(cssValue));
    element.style.display = 'block';
    element.style.borderLeft = 'solid 5px red';
    if (parsedValue == null) {
      logErrorMessage(
        `Failed to parse ${info.type} value for ${variableName}: "${String(cssValue)}"`,
      );
    }
    return (this.cache[variableName] = parsedValue);
  }
}

const evaluationProperties = {
  dimension: 'maxWidth',
  border: 'borderLeft',
  borderStyle: 'borderLeftStyle',
  color: 'color',
  display: 'display',
} as const;

export const computedValueGetterAtom = atom<ComputedValueGetter>(new ComputedValueGetter());
