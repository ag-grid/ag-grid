// Type definitions for @ag-grid-community/core v26.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../../context/beanStub";
import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { FocusService } from "../../../focusService";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
export interface IAbstractHeaderCellComp {
}
export declare class AbstractHeaderCellCtrl extends BeanStub {
    static DOM_DATA_KEY_HEADER_CTRL: string;
    protected focusService: FocusService;
    private instanceId;
    private columnGroupChild;
    private parentRowCtrl;
    protected eGui: HTMLElement;
    lastFocusEvent: KeyboardEvent | null;
    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl);
    protected shouldStopEventPropagation(e: KeyboardEvent): boolean;
    protected setGui(eGui: HTMLElement): void;
    private addDomData;
    focus(event?: KeyboardEvent): boolean;
    getRowIndex(): number;
    getParentRowCtrl(): HeaderRowCtrl;
    getPinned(): string | null;
    getInstanceId(): string;
    getColumnGroupChild(): IHeaderColumn;
}
