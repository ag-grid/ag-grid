import { atom, useAtomValue, useSetAtom } from 'jotai';
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
  private styleMap?: StylePropertyMapReadOnly;

  getComputedValue(variableName: string): Value | null {
    let styleMap = this.styleMap;
    if (!styleMap) {
      const element = document.getElementById(defaultsElementId);
      if (!element) {
        throw new Error(`${ComputedValueGetter.name} created before #${defaultsElementId} element`);
      }
      this.styleMap = styleMap = element.computedStyleMap();
    }

    const cachedValue = this.cache[variableName];
    if (cachedValue) return cachedValue;

    const info = getVariableInfoOrThrow(variableName);
    const cssValue = styleMap.get(variableName);
    if (!cssValue) return null;
    return (this.cache[variableName] = parseCssString(info, String(cssValue)));
  }
}

const computedValueGetterAtom = atom<ComputedValueGetter>(new ComputedValueGetter());
