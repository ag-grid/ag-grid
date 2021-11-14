// Type definitions for @ag-grid-community/core v26.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../../context/beanStub";
import { Column } from "../../../entities/column";
import { HeaderCellCtrl, IHeaderCellComp } from "./headerCellCtrl";
export declare class ResizeFeature extends BeanStub {
    private horizontalResizeService;
    private columnModel;
    private pinned;
    private column;
    private eResize;
    private comp;
    private resizeStartWidth;
    private resizeWithShiftKey;
    private ctrl;
    constructor(pinned: string | null, column: Column, eResize: HTMLElement, comp: IHeaderCellComp, ctrl: HeaderCellCtrl);
    private postConstruct;
    private onResizing;
    private onResizeStart;
    private normaliseResizeAmount;
}
