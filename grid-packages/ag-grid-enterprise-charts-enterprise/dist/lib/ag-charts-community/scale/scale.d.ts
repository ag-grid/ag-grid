export interface ScaleConvertParams {
    clampMode: 'clamped' | 'raw';
}
interface ScaleTickFormatParams {
    ticks?: any[];
    specifier?: any;
}
export interface Scale<D, R, I = number> {
    domain: D[];
    range: R[];
    nice?: boolean;
    tickCount?: number;
    interval?: I;
    convert(value: D, params?: ScaleConvertParams): R;
    invert?(value: R): D;
    ticks?(): D[];
    tickFormat?(params: ScaleTickFormatParams): (x: any) => string;
    getDomain?(): D[];
    bandwidth?: number;
    step?: number;
}
export {};
