import { KeyCode } from "@ag-grid-community/core";
import {
    AgRichSelect,
    ICellEditor,
    IRichCellEditorParams,
    PopupComponent,
    RefSelector,
    _,
} from "@ag-grid-community/core";

export class RichSelectCellEditor extends PopupComponent implements ICellEditor {

    private params: IRichCellEditorParams;
    private focusAfterAttached: boolean;
    private startedByEnter: boolean = false;

    @RefSelector('richSelect') private richSelect: AgRichSelect;

    constructor() {
        super(/* html */ 
            `<div class="ag-cell-edit-wrapper">
                <ag-rich-select class="ag-rich-select-editor" ref="richSelect"></ag-rich-select>
            </div>`
        );
    }

    public init(params: IRichCellEditorParams): void {
        this.focusAfterAttached = params.cellStartedEdit;

        if (_.missing(params.values)) {
            console.warn('AG Grid: richSelectCellEditor requires values for it to work');
            return;
        }

        this.richSelect.setValueList(params.values);
        this.startedByEnter = params.eventKey != null ? params.eventKey === KeyCode.ENTER : false;

        if (_.exists(this.params.cellHeight)) {
            this.richSelect.setRowHeight(this.params.cellHeight);
        }

        if (params.eventKey?.length === 1) {
            this.richSelect.searchText(params.eventKey);
        }
    }


    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void {
        // const selectedIndex = this.params.values.indexOf(this.selectedValue);

        if (this.focusAfterAttached) {
            this.richSelect.getFocusableElement().focus();
        }
    }

    public getValue(): any {
        return this.richSelect.getValue();
    }
}
