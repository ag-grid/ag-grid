import { RangeHandle } from '../shapes/rangeHandle';
export declare class NavigatorHandle {
    private readonly rh;
    set fill(value: string | undefined);
    get fill(): string | undefined;
    set stroke(value: string | undefined);
    get stroke(): string | undefined;
    set strokeWidth(value: number);
    get strokeWidth(): number;
    set width(value: number);
    get width(): number;
    set height(value: number);
    get height(): number;
    set gripLineGap(value: number);
    get gripLineGap(): number;
    set gripLineLength(value: number);
    get gripLineLength(): number;
    constructor(rangeHandle: RangeHandle);
}
