import { RangeMask } from '../shapes/rangeMask';
export declare class NavigatorMask {
    private readonly rm;
    set fill(value: string | undefined);
    get fill(): string | undefined;
    set stroke(value: string | undefined);
    get stroke(): string | undefined;
    set strokeWidth(value: number);
    get strokeWidth(): number;
    set fillOpacity(value: number);
    get fillOpacity(): number;
    constructor(rangeMask: RangeMask);
}
