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
export { _getParamType as getParamType, _paramValueToCss as paramValueToCss } from 'ag-grid-community';

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
