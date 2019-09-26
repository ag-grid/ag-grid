// ag-grid-enterprise v21.2.2
import { AbstractSelectionHandle } from "./abstractSelectionHandle";
export declare class RangeHandle extends AbstractSelectionHandle {
    static TEMPLATE: string;
    protected type: string;
    private endPosition;
    private rangeFixed;
    constructor();
    protected onDrag(e: MouseEvent): void;
    protected onDragEnd(e: MouseEvent): void;
    private fixRangeStartEnd;
}
