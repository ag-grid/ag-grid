import { SelectionHandleType } from "ag-grid-community";
import { AbstractSelectionHandle } from "./abstractSelectionHandle";
export declare class RangeHandle extends AbstractSelectionHandle {
    static TEMPLATE: string;
    protected type: SelectionHandleType;
    private endPosition;
    private rangeFixed;
    constructor();
    protected onDrag(e: MouseEvent): void;
    protected onDragEnd(e: MouseEvent): void;
    private fixRangeStartEnd;
}
