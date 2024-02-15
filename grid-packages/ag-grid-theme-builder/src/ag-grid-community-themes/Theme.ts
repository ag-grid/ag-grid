import { VariableTypes } from './GENERATED-parts-public';
import commonStructuralCSS from './css/common-structural.css?inline';
import { AnyPart, Part } from './theme-types';
import { kebabCase, logErrorMessage, presetParamName } from './theme-utils';

export type Theme = {
  name: string;
  css: Record<string, string>;
  icons: Record<string, string>;
};

export type PickVariables<P extends AnyPart, V extends object> = {
  [K in P['params'][number]]?: K extends keyof V ? V[K] : never;
};

export const defineTheme = <P extends AnyPart, V extends object = VariableTypes>(
  name: string,
  partOrParts: P | readonly P[],
  parameters: PickVariables<P, V>,
): Theme => {
  const result: Theme = {
    name,
    css: {
      common: commonStructuralCSS,
    },
    icons: {},
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
  for (const [property, value] of Object.entries(overrideParams)) {
    if (value === undefined) continue;
    if (allowedParams.has(property)) {
      mergedParams[property] = value;
    } else {
      logErrorMessage(
        `Invalid parameter ${property} provided. It may be misspelled, or your theme may not include the part that defines it.`,
      );
    }
  }

  // combine CSS and conditional CSS
  const themeClassSelector = `.ag-theme-${name}`;

  const mainCSS: string[] = [];
  for (const part of parts) {
    if (part.css) {
      mainCSS.push(`/* Part ${part.partId} */`);
      mainCSS.push(...part.css);
    }
    for (const [property, css] of Object.entries(part.conditionalCss || {})) {
      if (css && mergedParams[property]) {
        mainCSS.push(`/* Sub-part ${part.partId}.${property} */`);
        mainCSS.push(css);
      }
    }
  }

  if (mainCSS.length > 0) {
    result.css[`theme-${name}`] = preprocessCss(themeClassSelector, mainCSS.join('\n'));
  }

  // render variables
  const mergedParamEntries = Object.entries(mergedParams);
  if (mergedParamEntries.length > 0)
    result.css[`theme-${name}-variables`] =
      `\n${themeClassSelector} {\n` +
      mergedParamEntries
        .filter(([name]) => !presetProperties.has(name))
        .map(([name, value]) =>
          // TODO consider how to escape this, or validate and remove invalid values like "; border: 1px solid red;" which will inject unrelated styles
          // one idea: validate by removing single and double quoted strings, then escaped anything e.g. \; or \\, then check for no semicolons
          // Syntax spec: https://www.w3.org/TR/css-syntax-3/
          typeof value === 'string' ? `\t--ag-${kebabCase(name)}: ${value};\n` : '',
        )
        .join('') +
      '}';

  // combine icons
  for (const part of parts) {
    Object.assign(result.icons, part.icons);
  }

  return result;
};

const themeSelectorPlaceholder = ':ag-current-theme';
const preprocessCss = (themeSelector: string, css: string) =>
  css
    // rtlcss doesn't have an option to remove the space after the RTL selector,
    // so we're doing it here removing the space in `.ag-rtl .ag-theme-custom`
    .replaceAll(` ${themeSelectorPlaceholder}`, themeSelectorPlaceholder)
    .replaceAll(themeSelectorPlaceholder, themeSelector);

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
