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
  private styleMap?: CSSStyleDeclaration;

  getComputedValue(variableName: string): Value | null {
    const element = document.getElementById(defaultsElementId);
    if (!element) {
      throw new Error(`${ComputedValueGetter.name} created before #${defaultsElementId} element`);
    }
    let styleMap = this.styleMap;
    if (!styleMap) {
      this.styleMap = styleMap = getComputedStyle(element);
    }

    const cachedValue = this.cache[variableName];
    if (cachedValue !== undefined) return cachedValue;

    const info = getVariableInfoOrThrow(variableName);
    let cssValue: string;
    if (info.type === 'color') {
      element.style.color = `var(${variableName})`;
      cssValue = styleMap.color;
    } else {
      cssValue = styleMap.getPropertyValue(variableName);
    }
    if (!cssValue) return null;
    const parsedValue = parseCssString(info, String(cssValue));
    if (parsedValue == null) {
      logErrorMessage(`Failed to parse color value: "${String(cssValue)}"`);
    }
    return (this.cache[variableName] = parsedValue);
  }
}

const computedValueGetterAtom = atom<ComputedValueGetter>(new ComputedValueGetter());
