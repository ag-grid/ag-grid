// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../widgets/component";
export declare class CheckboxSelectionComponent extends Component {
    private gridOptionsWrapper;
    private eventService;
    private gridApi;
    private columnApi;
    private eCheckedIcon;
    private eUncheckedIcon;
    private eIndeterminateIcon;
    private rowNode;
    private column;
    constructor();
    private createAndAddIcons();
    private onDataChanged();
    private onSelectionChanged();
    private onCheckedClicked();
    private onUncheckedClicked(event);
    private onIndeterminateClicked(event);
    init(params: any): void;
    private showOrHideSelect();
}
