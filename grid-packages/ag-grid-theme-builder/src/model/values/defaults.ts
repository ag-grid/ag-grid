import { BorderVariableInfo, getVariableInfoOrThrow } from 'model/variableInfo';
import { Value } from '.';
import { BorderValue, border } from './border';
import { borderStyle } from './borderStyle';
import { color } from './color';
import { dimension } from './dimension';
import { display } from './display';

export const colorDefaultValue = color('#888');
export const dimensionDefaultValue = dimension(1, 'px');
export const borderDefaultValue = border('solid', dimension(1, 'px'), color('#999'));
export const borderStyleDefaultValue = borderStyle('solid');
export const displayDefaultValue = display('block');

export const addBorderValueDefaults = (
  info: BorderVariableInfo,
  value: BorderValue | null,
): BorderValue | null =>
  value == null
    ? null
    : border(
        value.style?.lineStyle || (info.style ? borderStyleDefaultValue.lineStyle : null),
        value.width || (info.width ? dimensionDefaultValue : null),
        value.color || (info.color ? colorDefaultValue : null),
      );

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
