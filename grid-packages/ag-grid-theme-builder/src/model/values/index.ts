import { VariableInfo } from 'model/variableInfo';
import { Border } from './_border';
import { BorderStyle } from './_borderStyle';
import { Color } from './_color';
import { Dimension } from './_dimension';
import { DisplayValue } from './_display';
import { pickRequiredBorderValues } from './defaults';

export type ValueType = 'color' | 'dimension' | 'border' | 'borderStyle' | 'display';

export type ValueByType = {
  color: Color;
  dimension: Dimension;
  border: Border;
  borderStyle: BorderStyle;
  display: DisplayValue;
};

export type Value = ValueByType[ValueType];

export const parseCssString = (info: VariableInfo, css: string): Value | null => {
  switch (info.type) {
    case 'color':
      return Color.parseCss(css);
    case 'dimension':
      return Dimension.parseCss(css);
    case 'border':
      return pickRequiredBorderValues(info, Border.parseCss(css));
    case 'borderStyle':
      return BorderStyle.parseCss(css);
    case 'display':
      return DisplayValue.parseCss(css);
  }
};

export type VariableValues = Record<string, Value | null | undefined>;
