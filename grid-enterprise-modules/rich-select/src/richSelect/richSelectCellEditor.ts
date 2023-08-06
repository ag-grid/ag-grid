import {
    AgRichSelect,
    ICellEditor,
    IRichCellEditorParams,
    KeyCreatorParams,
    IRichSelectParams,
    AgRichSelectValue,
    PopupComponent,
    _,
} from "@ag-grid-community/core";


export class RichSelectCellEditor extends PopupComponent implements ICellEditor {

    private params: IRichCellEditorParams;
    private focusAfterAttached: boolean;
    private richSelect: AgRichSelect;

    constructor() {
        super(/* html */ 
            `<div class="ag-cell-edit-wrapper"></div>`
        );
    }

    public init(params: IRichCellEditorParams): void {
        this.params = params;

        const  { cellStartedEdit, values, cellHeight } = params;

        if (_.missing(values)) {
            console.warn('AG Grid: richSelectCellEditor requires values for it to work');
            return;
        }

        const richSelectParams = this.buildRichSelectParams();

        this.richSelect = this.createManagedBean(new AgRichSelect(richSelectParams));
        this.getGui().appendChild(this.richSelect.getGui());

        this.focusAfterAttached = cellStartedEdit;

        if (_.exists(cellHeight)) {
            this.richSelect.setRowHeight(cellHeight);
        }
    }

    private buildRichSelectParams(): IRichSelectParams {
        const { cellRenderer, value, values, colDef, formatValue } = this.params;

        const ret: IRichSelectParams = {
            value: value,
            valueList: values,
            cellRenderer,
            valueFormatter: formatValue
        }

        if (typeof values[0] === 'object' && colDef.keyCreator) {
            ret.searchStringCreator = (values: AgRichSelectValue[]) => values.map((value: AgRichSelectValue) => {
                const keyParams: KeyCreatorParams = {
                    value: value,
                    colDef: this.params.colDef,
                    column: this.params.column,
                    node: this.params.node,
                    data: this.params.data,
                    api: this.gridOptionsService.api,
                    columnApi: this.gridOptionsService.columnApi,
                    context: this.gridOptionsService.context
                };
                return colDef.keyCreator!(keyParams);
            });

        }

        return ret;
    }


    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void {
        const { focusAfterAttached, params } = this;

        if (focusAfterAttached) {
            this.richSelect.getFocusableElement().focus();
        }

        this.richSelect.showPicker();

        const { eventKey } = params;
        if (eventKey) {
            if (eventKey?.length === 1) {
                this.richSelect.searchText(eventKey);
            }
        }
    }

    public getValue(): any {
        return this.richSelect.getValue();
    }

    isPopup(): boolean {
        return false;
    }
}
