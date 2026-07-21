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
    ShadowValueParams,
} from 'ag-grid-community';
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
