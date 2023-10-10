import { Feature } from './features';
import { Theme } from './themes';
import { mapPresentObjectValues } from './utils';
import { VariableValues } from './values';

export type RenderedTheme = {
  themeName: string;
  values: VariableValues;
};

type RenderArgs = { theme: Theme; features: ReadonlyArray<Feature>; values: VariableValues };

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
  const properties = mapPresentObjectValues(values, (value) => value.toCss());
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
