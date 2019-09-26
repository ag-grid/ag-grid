// ag-grid-enterprise v21.2.2
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
    protected type: string;
    constructor();
    protected onDrag(e: MouseEvent): void;
    protected onDragEnd(e: MouseEvent): void;
    private handleValueChanged;
    private clearCellsInRange;
    private processValues;
    protected clearValues(): void;
    private clearMarkedPath;
    private clearCellValues;
    private markPathFrom;
    private extendVertical;
    private reduceVertical;
    private extendHorizontal;
    private reduceHorizontal;
    refresh(cellComp: CellComp): void;
}
