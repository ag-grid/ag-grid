import { Feature } from './features';
import { Theme } from './themes';
import { mapPresentObjectValues } from './utils';
import { VariableValues, valueToCss } from './values';

export type RenderedTheme = {
  themeName: string;
  values: VariableValues;
};

type RenderArgs = { theme: Theme; features: Feature[]; values: VariableValues };

export const renderTheme = (state: RenderArgs): RenderedTheme => {
  return {
    themeName: state.theme.name,
    values: mapPresentObjectValues(state.values, (v) => v),
  };
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

  const borderRadius = properties['--ag-border-radius'];
  if (borderRadius) {
    css += `\n.${themeName} .ag-root-wrapper {\n`;
    css += `    border-radius: ${borderRadius};\n`;
    css += `}`;
  }
  return css;
};

export const renderCSS = (state: RenderArgs): string => renderedThemeToCss(renderTheme(state));
