import { BorderVariableInfo, getVariableInfoOrThrow } from 'model/variableInfo';
import { Value } from '.';
import { Border } from './_border';
import { BorderStyle } from './_borderStyle';
import { Color } from './_color';
import { Dimension } from './_dimension';
import { DisplayValue } from './_display';

export const colorDefaultValue = new Color(128, 128, 128, 1);
export const dimensionDefaultValue = new Dimension(1, 'px');
export const borderStyleDefaultValue = new BorderStyle('solid');
export const borderDefaultValue = new Border(
  borderStyleDefaultValue,
  dimensionDefaultValue,
  colorDefaultValue,
);
export const displayDefaultValue = new DisplayValue('block');

export const pickRequiredBorderValues = (
  info: BorderVariableInfo,
  value: Border | null,
): Border | null => {
  return new Border(
    info.style ? value?.style || borderStyleDefaultValue : null,
    info.width ? value?.width || dimensionDefaultValue : null,
    info.color ? value?.color || colorDefaultValue : null,
  );
};

export const getVariableDefaultValue = (variableName: string): Value => {
  const info = getVariableInfoOrThrow(variableName);
  switch (info.type) {
    case 'color':
      return colorDefaultValue;
    case 'dimension':
      return dimensionDefaultValue;
    case 'border':
      return borderDefaultValue;
    case 'borderStyle':
      return borderStyleDefaultValue;
    case 'display':
      return displayDefaultValue;
  }
};
