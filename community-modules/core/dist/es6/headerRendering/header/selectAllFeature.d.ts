// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgCheckbox } from "../../widgets/agCheckbox";
import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
export declare class SelectAllFeature extends BeanStub {
    private gridApi;
    private columnApi;
    private rowModel;
    private selectionController;
    private cbSelectAllVisible;
    private processingEventFromCheckbox;
    private column;
    private filteredOnly;
    private cbSelectAll;
    constructor(cbSelectAll: AgCheckbox, column: Column);
    private postConstruct;
    private showOrHideSelectAll;
    private refreshHeaderAriaDescribedBy;
    private onModelChanged;
    private onSelectionChanged;
    private getNextCheckboxState;
    private updateStateOfCheckbox;
    private refreshSelectAllLabel;
    private getSelectionCount;
    private checkRightRowModelType;
    private onCbSelectAll;
    private isCheckboxSelection;
}
