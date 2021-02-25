// Type definitions for @ag-grid-community/core v25.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from '../widgets/component';
export declare class CheckboxSelectionComponent extends Component {
    private eCheckbox;
    private rowNode;
    private column;
    private isRowSelectableFunc;
    constructor();
    private postConstruct;
    getCheckboxId(): string;
    private onDataChanged;
    private onSelectableChanged;
    private onSelectionChanged;
    private onCheckedClicked;
    private onUncheckedClicked;
    init(params: any): void;
    private showOrHideSelect;
    private checkboxCallbackExists;
}
