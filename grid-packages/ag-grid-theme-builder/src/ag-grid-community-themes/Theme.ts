import { logErrorMessageOnce } from '../model/utils';
import { ParamTypes } from './GENERATED-parts-public';
import commonStructuralCSS from './css/common-structural.css?inline';
import { AnyPart, CssFragment, Part } from './theme-types';
import { camelCase, logErrorMessage, paramToVariableName, presetParamName } from './theme-utils';

export type Theme = {
  name: string;
  css: Record<string, string>;
  icons: Record<string, string>;
  variableDefaults: Record<string, string>;
};

export type PickVariables<P extends AnyPart, V extends object> = {
  [K in P['params'][number]]?: K extends keyof V ? V[K] : never;
};

export const defineTheme = <P extends AnyPart, V extends object = ParamTypes>(
  themeName: string,
  partOrParts: P | readonly P[],
  parameters: PickVariables<P, V>,
): Theme => {
  const result: Theme = {
    name: themeName,
    css: {
      common: commonStructuralCSS,
    },
    icons: {},
    variableDefaults: {},
  };

  const parts = flattenParts(Array.isArray(partOrParts) ? partOrParts : [partOrParts]);
  const overrideParams = parameters as Record<string, any>;
  const mergedParams: Record<string, any> = {};

  // merge part defaults
  for (const part of parts) {
    Object.assign(mergedParams, part.defaults);
  }

  // apply presets, which override defaults
  const presetProperties = new Set<string>();
  for (const part of parts) {
    if (part.presets) {
      const presetProperty = presetParamName(part.partId);
      presetProperties.add(presetProperty);
      const activePreset =
        overrideParams[presetProperty] !== undefined
          ? overrideParams[presetProperty]
          : mergedParams[presetProperty];
      if (activePreset) {
        const preset = part.presets?.[activePreset];
        if (preset) {
          Object.assign(mergedParams, preset);
        } else {
          logErrorMessage(
            `Invalid value ${activePreset} for ${presetProperty} (valid values are ${Object.keys(part.presets || {}).join(', ')}`,
          );
        }
      }
    }
  }

  const allowedParams = new Set(parts.flatMap((part) => part.params));

  // apply params passed to this method, which override presets and defaults
  for (const [name, value] of Object.entries(overrideParams)) {
    if (value === undefined) continue;
    if (allowedParams.has(name)) {
      if (validateParam(name, value, allowedParams)) {
        mergedParams[name] = value;
      }
    } else {
      logErrorMessageOnce(`Invalid theme parameter ${name} provided. ${invalidParamMessage}`);
    }
  }

  // render variables
  for (const name of Object.keys(mergedParams)) {
    let value = mergedParams[name];
    if (isBorderParam(name)) {
      if (value === true) {
        value = mergedParams[name] = '1px solid var(--ag-border-color)';
      } else if (value === false) {
        value = mergedParams[name] = 'none';
      }
    }
    if (!presetProperties.has(name) && typeof value === 'string' && value) {
      result.variableDefaults[paramToVariableName(name)] = value;
    }
  }

  // combine CSS and conditional CSS
  const mainCSS: string[] = [];
  for (const part of parts) {
    if (part.css) {
      mainCSS.push(`/* Part ${part.partId} */`);
      mainCSS.push(...part.css.map((p) => cssPartToString(p, mergedParams)));
    }
    for (const [property, css] of Object.entries(part.conditionalCss || {})) {
      if (css && mergedParams[property]) {
        mainCSS.push(`/* Sub-part ${part.partId}.${property} */`);
        mainCSS.push(cssPartToString(css, mergedParams));
      }
    }
  }

  if (mainCSS.length > 0) {
    result.css[`theme-${themeName}`] = preprocessCss(
      themeName,
      result.variableDefaults,
      mainCSS.join('\n'),
    );
  }

  // combine icons
  for (const part of parts) {
    Object.assign(result.icons, part.icons);
  }

  return result;
};

const cssPartToString = (p: CssFragment, params: Record<string, any>): string =>
  typeof p === 'function' ? p(params) : p;

const isBorderParam = (property: string) =>
  property.startsWith('borders') || property.endsWith('Border');

const validateParam = (property: string, value: unknown, allowedParams: Set<string>): boolean => {
  const actualType = typeof value;
  if (isBorderParam(property) && actualType === 'boolean') return true;
  if (actualType !== 'string') {
    logErrorMessageOnce(
      `Invalid value for ${property} (expected a string, got ${describeValue(value)})`,
    );
    return false;
  }
  if (typeof value === 'string') {
    for (const varMatch of value.matchAll(/var\(--ag-([a-z-]+)[^)]*\)/g)) {
      const paramName = camelCase(varMatch[1]);
      if (!allowedParams.has(paramName)) {
        logErrorMessageOnce(
          `Invalid value provided to theme parameter ${property}. Expression "${varMatch[0]}" refers to non-existent parameter ${paramName}. ${invalidParamMessage}`,
        );
      }
    }
  }
  return true;
};

const invalidParamMessage =
  'It may be misspelled, or your theme may not include the part that defines it.';

const describeValue = (value: any): string => {
  if (value == null) return String(value);
  return `${typeof value} ${value}`;
};

const preprocessCss = (themeName: string, variables: Record<string, string>, css: string) => {
  const themeSelector = `.ag-theme-${themeName}`;
  const themeSelectorPlaceholder = ':ag-current-theme';

  css = addVariableDefaults(css, variables);

  // rtlcss doesn't have an option to remove the space after the RTL selector,
  // so we're doing it here removing the space in `.ag-rtl .ag-theme-custom`
  css = css.replaceAll(` ${themeSelectorPlaceholder}`, themeSelectorPlaceholder);
  css = css.replaceAll(themeSelectorPlaceholder, themeSelector);

  return css;
};

// Add default values to var(--ag-foo) expressions. This is recursive - if the
// default value for --ag-foo is var(--ag-bar) then `var(--ag-foo)` becomes
// `var(--ag-foo, var(--ag-bar, [bar default]))`
export const addVariableDefaults = (css: string, variables: Record<string, string>): string =>
  css.replaceAll(
    // omit all --ag-internal vars, and --ag-line-height which comes from grid code not a param
    /var\((--ag-(?!line-height[^\w-]|internal)[^)]+)\)/g,
    (match, variable) => {
      if (!/^[\w-]+$/.test(variable) && variable !== '--ag-line-height') {
        throw new Error(`${match} - variables should not contain default values ${variable}.`);
      } else if (!Object.hasOwn(variables, variable)) {
        logErrorMessageOnce(`${variable} does not match a theme param`);
      }
      const defaultValue = variables[variable];
      if (defaultValue) {
        return `var(${variable}, ${addVariableDefaults(defaultValue, variables)})`;
      } else {
        return match;
      }
    },
  );

const flattenParts = (parts: readonly AnyPart[]): Part[] => {
  const result: Part[] = [];
  for (const part of parts) {
    if ('componentParts' in part) {
      result.push(...flattenParts(part.componentParts));
    } else {
      result.push(part);
    }
  }
  return result;
};

export const installTheme = (theme: Theme) => {
  for (const [name, css] of Object.entries(theme.css)) {
    addOrUpdateStyle(name, css);
  }
};

const addOrUpdateStyle = (id: string, css: string) => {
  id = `ag-injected-style-${id}`;
  const head = document.querySelector('head');
  if (!head) throw new Error("Can't inject theme before document head is created");
  let style = head.querySelector(`#${id}`) as HTMLStyleElement;
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('id', id);
    style.setAttribute('data-ag-injected-style', '');
    const others = document.querySelectorAll('head [data-ag-injected-style]');
    if (others.length > 0) {
      const lastOther = others[others.length - 1];
      if (lastOther.nextSibling) {
        head.insertBefore(style, lastOther.nextSibling);
      } else {
        head.appendChild(style);
      }
    } else {
      head.insertBefore(style, head.firstChild);
    }
  }
  style.textContent = css;
};
