import { SelectionHandleType } from '@ag-grid-community/core';
import { AbstractSelectionHandle } from './abstractSelectionHandle';
export declare class AgRangeHandle extends AbstractSelectionHandle {
    protected type: SelectionHandleType;
    private endPosition;
    private rangeFixed;
    constructor();
    protected onDrag(e: MouseEvent): void;
    protected onDragEnd(e: MouseEvent): void;
    private fixRangeStartEnd;
}
