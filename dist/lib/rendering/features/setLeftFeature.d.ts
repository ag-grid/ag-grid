// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { BeanStub } from "../../context/beanStub";
export declare class SetLeftFeature extends BeanStub {
    private columnOrGroup;
    private eCell;
    private gridOptionsWrapper;
    private columnAnimationService;
    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement);
    private init();
    private setLeftFirstTime();
    private animateInLeft();
    private onLeftChanged();
    private setLeft(value);
}
