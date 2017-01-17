// Type definitions for ag-grid v7.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { BeanStub } from "../../context/beanStub";
export declare class SetLeftFeature extends BeanStub {
    private columnOrGroup;
    private eCell;
    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement);
    private init();
    private onLeftChanged();
}
