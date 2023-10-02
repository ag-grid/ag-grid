import { getVariableInfoOrThrow } from 'model/variableInfo';
import { BorderValue, border, borderToCss, parseCssBorder } from './border';
import {
  BorderStyleValue,
  borderStyle,
  borderStyleToCss,
  parseCssBorderStyle,
} from './borderStyle';
import { ColorValue, color, colorToCss, parseCssColor } from './color';
import { DimensionValue, dimension, dimensionToCss, parseCssDimension } from './dimension';

export type ValueType = 'color' | 'dimension' | 'border' | 'borderStyle';

export type ValueByType = {
  color: ColorValue;
  dimension: DimensionValue;
  border: BorderValue;
  borderStyle: BorderStyleValue;
};

export type Value = ValueByType[ValueType];

export const parseCssString = (type: ValueType, css: string): Value | null => {
  switch (type) {
    case 'color':
      return parseCssColor(css);
    case 'dimension':
      return parseCssDimension(css);
    case 'border':
      return parseCssBorder(css);
    case 'borderStyle':
      return parseCssBorderStyle(css);
  }
};

export type VariableValues = Record<string, Value | null | undefined>;

export const valueToCss = (value: Value): string => {
  switch (value.type) {
    case 'color':
      return colorToCss(value);
    case 'dimension':
      return dimensionToCss(value);
    case 'border':
      return borderToCss(value);
    case 'borderStyle':
      return borderStyleToCss(value);
  }
};

export const colorDefaultValue = color('#999');
export const dimensionDefaultValue = dimension(1, 'px');
export const borderDefaultValue = border('solid', dimension(1, 'px'), color('#999'));
export const borderStyleDefaultValue = borderStyle('solid');

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
  }
};
