export type {
    BorderStyleValue,
    BorderValue,
    ColorSchemeValue,
    ColorValue,
    DurationValue,
    FontFamilyValue,
    FontWeightValue,
    ImageValue,
    LengthValue,
    ScaleValue,
    ShadowValue,
} from 'ag-stack';
export { getParamType, paramValueToCss } from 'ag-stack';

export type ParamType =
    | 'colorScheme'
    | 'color'
    | 'length'
    | 'scale'
    | 'borderStyle'
    | 'border'
    | 'shadow'
    | 'image'
    | 'fontFamily'
    | 'fontWeight'
    | 'duration';
