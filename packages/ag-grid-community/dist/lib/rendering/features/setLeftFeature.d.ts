// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
import { Beans } from "../beans";
export declare class SetLeftFeature extends BeanStub {
    private readonly columnOrGroup;
    private eCell;
    private actualLeft;
    private colsSpanning;
    private beans;
    private readonly printLayout;
    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement, beans: Beans, colsSpanning?: Column[]);
    setColsSpanning(colsSpanning: Column[]): void;
    getColumnOrGroup(): ColumnGroupChild;
    init(): void;
    private setLeftFirstTime;
    private animateInLeft;
    private onLeftChanged;
    private modifyLeftForPrintLayout;
    private setLeft;
}
