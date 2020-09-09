import { RangeMask } from "../shapes/rangeMask";
export declare class NavigatorMask {
    private readonly rm;
    fill: string | undefined;
    stroke: string | undefined;
    strokeWidth: number;
    fillOpacity: number;
    constructor(rangeMask: RangeMask);
}
