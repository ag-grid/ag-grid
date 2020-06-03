import { RangeHandle } from "../shapes/rangeHandle";
export declare class NavigatorHandle {
    private readonly rh;
    fill: string;
    stroke: string;
    strokeWidth: number;
    width: number;
    height: number;
    gripLineGap: number;
    gripLineLength: number;
    constructor(rangeHandle: RangeHandle);
}
