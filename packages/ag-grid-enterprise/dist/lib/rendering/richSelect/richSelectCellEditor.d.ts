// ag-grid-enterprise v21.2.2
import { ICellEditor, IRichCellEditorParams, PopupComponent } from "ag-grid-community";
export declare class RichSelectCellEditor extends PopupComponent implements ICellEditor {
    private static TEMPLATE;
    private userComponentFactory;
    private gridOptionsWrapper;
    private eValue;
    private eList;
    private params;
    private virtualList;
    private focusAfterAttached;
    private selectedValue;
    private originalSelectedValue;
    private selectionConfirmed;
    private searchString;
    constructor();
    init(params: IRichCellEditorParams): void;
    private onKeyDown;
    private onEnterKeyDown;
    private onNavigationKeyPressed;
    private searchText;
    private runSearch;
    private clearSearchString;
    private renderSelectedValue;
    private setSelectedValue;
    private createRowComponent;
    private onMouseMove;
    private onClick;
    afterGuiAttached(): void;
    getValue(): any;
}
