// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { AgCheckbox } from "../../widgets/agCheckbox";
import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
export declare class SelectAllFeature extends BeanStub {
    private gridApi;
    private columnApi;
    private eventService;
    private rowModel;
    private selectionController;
    private cbSelectAllVisible;
    private processingEventFromCheckbox;
    private column;
    private filteredOnly;
    private cbSelectAll;
    constructor(cbSelectAll: AgCheckbox, column: Column);
    private postConstruct();
    private onFilterChanged();
    private onSelectionChanged();
    private getNextCheckboxState(selectionCount);
    private updateStateOfCheckbox();
    private getSelectionCount();
    private checkRightRowModelType();
    private showOrHideSelectAll();
    private onCbSelectAll();
    private isCheckboxSelection();
}
