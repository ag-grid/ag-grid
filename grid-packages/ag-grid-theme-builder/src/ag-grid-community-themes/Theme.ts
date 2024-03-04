import { logErrorMessageOnce } from '../model/utils';
import { ParamTypes } from './GENERATED-parts-public';
import commonStructuralCSS from './css/common-structural.css?inline';
import { AnyPart, CssSource, Part } from './theme-types';
import {
  borderValueToCss,
  camelCase,
  logErrorMessage,
  paramToVariableName,
  presetParamName,
} from './theme-utils';

export type Theme = {
  css: string;
  icons: Record<string, string>;
  paramDefaults: Record<string, string>;
};

export type PickVariables<P extends AnyPart, V extends object> = {
  [K in P['params'][number]]?: K extends keyof V ? V[K] : never;
};

export const defineTheme = <P extends AnyPart, V extends object = ParamTypes>(
  partOrParts: P | readonly P[],
  parameters: PickVariables<P, V>,
): Theme => {
  const result: Theme = {
    css: '',
    icons: {},
    paramDefaults: {},
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

  // render variable defaults using :where(html) to ensure lowest specificity so that
  // `html { --ag-foreground-color: red; }` will override this
  let variableDefaults = ':where(html) {\n';
  for (const name of Object.keys(mergedParams)) {
    let value = mergedParams[name];
    if (isBorderParam(name)) {
      value = borderValueToCss(value);
    }
    if (!presetProperties.has(name) && typeof value === 'string' && value) {
      variableDefaults += `\t${paramToVariableName(name)}: ${value};\n`;
      result.paramDefaults[name] = value;
    }
  }
  variableDefaults += '}';

  // combine CSS
  const mainCSS: string[] = [variableDefaults, commonStructuralCSS];
  for (const part of parts) {
    if (part.css) {
      mainCSS.push(`/* Part ${part.partId} */`);
      mainCSS.push(...part.css.map((p) => cssPartToString(p, mergedParams)));
    }
  }
  result.css = mainCSS.join('\n');

  checkForUnsupportedVariables(result.css, Object.keys(mergedParams));

  // combine icons
  for (const part of parts) {
    Object.assign(result.icons, part.icons);
  }

  return result;
};

export const checkForUnsupportedVariables = (css: string, params: string[]) => {
  const allowedVariables = new Set(params.map(paramToVariableName));
  allowedVariables.add('--ag-line-height');
  allowedVariables.add('--ag-indentation-level');
  for (const [, variable] of css.matchAll(/var\((--ag-[\w-]+)[^)]*\)/g)) {
    if (!allowedVariables.has(variable) && !variable.startsWith('--ag-internal')) {
      logErrorMessageOnce(`${variable} does not match a theme param`);
    }
  }
};

const cssPartToString = (p: CssSource, params: Record<string, any>): string =>
  // TODO allowing part functions to take params is a hack for icons to include
  // the stroke width in the embedded SVG, when we implement inline SVGs combine
  // all part CSS at build time and treat it as a string
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
  const id = 'ag-injected-style';
  const head = document.querySelector('head');
  if (!head) throw new Error("Can't install theme before document head is created");
  let style = head.querySelector(`#${id}`) as HTMLStyleElement;
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('id', id);
    head.insertBefore(style, head.firstChild);
  }
  style.textContent = theme.css;
};
