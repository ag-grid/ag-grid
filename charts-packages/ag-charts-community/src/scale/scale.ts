export interface ScaleClampParams {
    /**
     * If `true` the values outside of the domain will become `NaN`.
     * If `false` such values will be clamped to the domain edges.
     */
    strict: boolean;
}

export interface ScaleTickFormatParams {
    count?: any;
    ticks?: any[];
    specifier?: any;
}

export interface Scale<D, R> {
    domain: D[];
    range: R[];
    nice?: boolean;
    tickCount?: number;
    convert(value: D, params?: ScaleClampParams): R;
    invert?(value: R): D;
    ticks?(): D[];
    tickFormat?(params: ScaleTickFormatParams): (x: any) => string;
    bandwidth?: number;
}
