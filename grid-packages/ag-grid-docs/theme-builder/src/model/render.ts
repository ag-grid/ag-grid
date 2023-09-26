import { Feature } from './features';
import { Theme, getThemeChain } from './themes';
import { mapPresentObjectValues } from './utils';
import { VariableValues, colorWithAlpha, colorWithSelfOverlay, valueToCss } from './values';

export type RenderedTheme = {
  themeName: string;
  values: VariableValues;
};

type RenderArgs = { theme: Theme; features: Feature[]; values: VariableValues };

export const renderTheme = (state: RenderArgs): RenderedTheme => {
  const values: VariableValues = {};

  const themes = getThemeChain(state.theme);

  const allowedVariables = new Set(themes.flatMap((theme) => theme.addedVariables));

  for (const feature of state.features) {
    for (const variable of feature.variableNames) {
      const value = state.values[variable];
      if (value && allowedVariables.has(variable)) {
        values[variable] = value;
      }
    }
  }

  for (const theme of themes) {
    for (const blend of theme.colorBlends) {
      if (
        !values[blend.destination] &&
        allowedVariables.has(blend.destination) &&
        allowedVariables.has(blend.source)
      ) {
        let value = values[blend.source];
        if (value && value.type === 'color') {
          if (blend.alpha) {
            value = colorWithAlpha(value, blend.alpha);
          }
          if (blend.selfOverlay) {
            value = colorWithSelfOverlay(value, blend.selfOverlay);
          }
          values[blend.destination] = value;
        }
      }
    }
  }

  return { themeName: state.theme.name, values };
};

export const renderedThemeToCss = ({
  values,
  themeName,
}: {
  values: VariableValues;
  themeName: string;
}) => {
  const properties = mapPresentObjectValues(values, valueToCss);
  let css = `.${themeName} {\n`;

  for (const [key, value] of Object.entries(properties)) {
    if (key && value) {
      css += `    ${key}: ${value};\n`;
    }
  }
  css += '}';
  return css;
};

export const renderCSS = (state: RenderArgs): string => renderedThemeToCss(renderTheme(state));
