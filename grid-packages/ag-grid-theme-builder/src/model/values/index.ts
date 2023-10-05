import { VariableInfo } from 'model/variableInfo';
import { BorderValue, borderToCss, parseCssBorder } from './border';
import { BorderStyleValue, borderStyleToCss, parseCssBorderStyle } from './borderStyle';
import { ColorValue, colorToCss, parseCssColor } from './color';
import { addBorderValueDefaults } from './defaults';
import { DimensionValue, dimensionToCss, parseCssDimension } from './dimension';
import { DisplayValue, displayToCss, parseCssDisplay } from './display';

export type ValueType = 'color' | 'dimension' | 'border' | 'borderStyle' | 'display';

export type ValueByType = {
  color: ColorValue;
  dimension: DimensionValue;
  border: BorderValue;
  borderStyle: BorderStyleValue;
  display: DisplayValue;
};

export type Value = ValueByType[ValueType];

export const parseCssString = (info: VariableInfo, css: string): Value | null => {
  switch (info.type) {
    case 'color':
      return parseCssColor(css);
    case 'dimension':
      return parseCssDimension(css);
    case 'border':
      return addBorderValueDefaults(info, parseCssBorder(css));
    case 'borderStyle':
      return parseCssBorderStyle(css);
    case 'display':
      return parseCssDisplay(css);
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
    case 'display':
      return displayToCss(value);
  }
};
