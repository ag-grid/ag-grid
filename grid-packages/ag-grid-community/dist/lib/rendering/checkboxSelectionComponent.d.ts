import { Column } from '../entities/column';
import { Component } from '../widgets/component';
import { RowNode } from '../entities/rowNode';
import { CheckboxSelectionCallback } from '../entities/colDef';
export declare class CheckboxSelectionComponent extends Component {
    private eCheckbox;
    private rowNode;
    private column;
    private overrides?;
    constructor();
    private postConstruct;
    getCheckboxId(): string;
    private onDataChanged;
    private onSelectableChanged;
    private onSelectionChanged;
    private onCheckedClicked;
    private onUncheckedClicked;
    init(params: {
        rowNode: RowNode;
        column?: Column;
        overrides?: {
            isVisible: boolean | CheckboxSelectionCallback<any>;
            callbackParams: any;
            removeHidden: boolean;
        };
    }): void;
    private showOrHideSelect;
    private getIsVisible;
}
