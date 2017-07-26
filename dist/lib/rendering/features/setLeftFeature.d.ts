// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
export declare class SetLeftFeature extends BeanStub {
    private columnOrGroup;
    private eCell;
    private actualLeft;
    private colsSpanning;
    private gridOptionsWrapper;
    private columnAnimationService;
    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement, colsSpanning?: Column[]);
    setColsSpanning(colsSpanning: Column[]): void;
    getColumnOrGroup(): ColumnGroupChild;
    private init();
    private setLeftFirstTime();
    private animateInLeft();
    private onLeftChanged();
    private setLeft(value);
}
