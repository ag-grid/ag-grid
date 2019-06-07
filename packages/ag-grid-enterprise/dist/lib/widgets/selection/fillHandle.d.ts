// ag-grid-enterprise v21.0.1
import { CellComp } from 'ag-grid-community';
import { AbstractSelectionHandle } from "./abstractSelectionHandle";
export declare class FillHandle extends AbstractSelectionHandle {
    private valueService;
    static TEMPLATE: string;
    private initialPosition;
    private initialXY;
    private lastCellMarked;
    private markedCellComps;
    private cellValues;
    private dragAxis;
    private isUp;
    private isLeft;
    private isReduce;
    private extendFunction;
    protected type: string;
    constructor();
    protected onDrag(e: MouseEvent): void;
    protected onDragEnd(e: MouseEvent): void;
    private runReducers;
    protected clearValues(): void;
    private markPathFrom;
    private extendVertical;
    private reduceVertical;
    private extendHorizontal;
    private reduceHorizontal;
    private clearMarkedPath;
    refresh(cellComp: CellComp): void;
}
