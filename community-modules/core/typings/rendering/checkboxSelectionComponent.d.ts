import { Component } from '../widgets/component';
export declare class CheckboxSelectionComponent extends Component {
    private gridOptionsWrapper;
    private eventService;
    private gridApi;
    private columnApi;
    private eCheckedIcon;
    private eUncheckedIcon;
    private eIndeterminateIcon;
    private checkbox;
    private rowNode;
    private column;
    private isRowSelectableFunc;
    constructor();
    private createAndAddIcons;
    private onDataChanged;
    private onSelectableChanged;
    private onSelectionChanged;
    private onCheckedClicked;
    private onUncheckedClicked;
    private onIndeterminateClicked;
    private onCheckboxClicked;
    init(params: any): void;
    private showOrHideSelect;
    private checkboxCallbackExists;
}
