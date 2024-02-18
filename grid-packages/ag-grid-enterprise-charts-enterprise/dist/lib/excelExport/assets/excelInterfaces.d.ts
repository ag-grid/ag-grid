import { ExcelFont, ExcelImage } from "ag-grid-community";
export declare type ImageIdMap = Map</** imageId */ string, {
    type: string;
    index: number;
}>;
export declare type BorderProperty = string | undefined;
export interface NumberFormat {
    formatCode: string;
    numFmtId: number;
}
export interface ImageColor {
    color: string;
    tint?: number;
    saturation?: number;
}
export interface ImageAnchor {
    row: number;
    col: number;
    offsetX: number;
    offsetY: number;
}
export interface ImageBoxSize {
    from: ImageAnchor;
    to: ImageAnchor;
    height: number;
    width: number;
}
export interface Border {
    style?: string;
    color?: string;
}
export interface BorderSet {
    left?: Border;
    right?: Border;
    top?: Border;
    bottom?: Border;
    diagonal?: Border;
}
export interface StylesMap {
    [key: string]: number;
}
export interface ColorMap {
    [key: string]: string;
}
export interface ExcelThemeFont extends ExcelFont {
    colorTheme?: string;
    scheme?: string;
}
export interface Fill {
    patternType: string;
    fgTheme?: string;
    fgTint?: string;
    fgRgb?: string;
    bgIndexed?: string;
    bgRgb?: string;
}
export interface ExcelCalculatedImage extends ExcelImage {
    totalWidth: number;
    totalHeight: number;
}
