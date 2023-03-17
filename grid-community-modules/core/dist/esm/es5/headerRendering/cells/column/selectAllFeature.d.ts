// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../../context/beanStub";
import { Column } from "../../../entities/column";
import { HeaderCellCtrl } from "./headerCellCtrl";
export declare class SelectAllFeature extends BeanStub {
    private gridApi;
    private columnApi;
    private rowModel;
    private selectionService;
    private cbSelectAllVisible;
    private processingEventFromCheckbox;
    private column;
    private headerCellCtrl;
    private filteredOnly;
    private currentPageOnly;
    private cbSelectAll;
    constructor(column: Column);
    onSpaceKeyPressed(e: KeyboardEvent): void;
    getCheckboxGui(): HTMLElement;
    setComp(ctrl: HeaderCellCtrl): void;
    private showOrHideSelectAll;
    private onModelChanged;
    private onSelectionChanged;
    private updateStateOfCheckbox;
    private refreshSelectAllLabel;
    private checkRightRowModelType;
    private onCbSelectAll;
    private isCheckboxSelection;
}
