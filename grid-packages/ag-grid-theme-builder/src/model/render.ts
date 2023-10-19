import { mapPresentObjectValues } from './utils';
import { VariableValues } from './values';

export const renderCss = ({ values, themeName }: { values: VariableValues; themeName: string }) => {
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
