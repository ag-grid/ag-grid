import { logErrorMessage } from './utils';
import { Value, parseCssString } from './values';
import { allVariableNames, getVariableInfo } from './variables';

const themeVariableDefaults: Record<string, Record<string, Value | undefined>> = {};

export const getVariableDefault = (themeName: string, variableName: string): Value | null => {
  themeVariableDefaults[themeName] ||= getVariableDefaults(themeName);
  return themeVariableDefaults[themeName][variableName] || null;
};

const getVariableDefaults = (themeName: string) => {
  const defaults: Record<string, Value> = {};
  const el = document.createElement('div');
  el.className = themeName;
  document.body.appendChild(el);
  try {
    const style = el.computedStyleMap();
    for (const variableName of allVariableNames) {
      const cssValue = style.get(variableName);
      const info = getVariableInfo(variableName);
      if (!cssValue || !info) continue;
      const value = parseCssString(info.type, String(cssValue));
      if (!value) {
        if (info.type === 'color' && String(cssValue) === 'none') {
          // special case - "none" is not a valid CSS color, but we
          // use it in themes as a hack to cause the variable value to
          // be ignored, e.g. `--input-focus-border-color: none` will
          // cause the border color not to change when the input
          // focusses
          continue;
        }
        logErrorMessage(
          `Could not parse CSS ${info.type} ${cssValue.toString()} (${variableName})`,
        );
      } else {
        defaults[variableName] = value;
      }
    }
    return defaults;
  } finally {
    document.body.removeChild(el);
  }
};
