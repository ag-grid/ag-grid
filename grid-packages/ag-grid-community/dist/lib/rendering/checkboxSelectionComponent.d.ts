import { Component } from '../widgets/component';
export declare class CheckboxSelectionComponent extends Component {
    private gridOptionsWrapper;
    private eventService;
    private eCheckbox;
    private rowNode;
    private column;
    private isRowSelectableFunc;
    constructor();
    private onDataChanged;
    private onSelectableChanged;
    private onSelectionChanged;
    private onCheckedClicked;
    private onUncheckedClicked;
    init(params: any): void;
    private showOrHideSelect;
    private checkboxCallbackExists;
}
