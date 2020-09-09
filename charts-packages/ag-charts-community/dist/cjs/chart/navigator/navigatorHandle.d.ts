import { RangeHandle } from "../shapes/rangeHandle";
export declare class NavigatorHandle {
    private readonly rh;
    fill: string | undefined;
    stroke: string | undefined;
    strokeWidth: number;
    width: number;
    height: number;
    gripLineGap: number;
    gripLineLength: number;
    constructor(rangeHandle: RangeHandle);
}
