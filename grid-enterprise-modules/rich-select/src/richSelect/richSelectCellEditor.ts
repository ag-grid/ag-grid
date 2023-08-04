import { ICellRendererParams } from "@ag-grid-community/core";
import { KeyCreatorParams } from "@ag-grid-community/core";
import { IRichSelectParams } from "@ag-grid-community/core";
import { Autowired, UserComponentFactory } from "@ag-grid-community/core";
import {
    AgRichSelect,
    ICellEditor,
    IRichCellEditorParams,
    RefSelector,
    PopupComponent,
    KeyCode,
    _,
} from "@ag-grid-community/core";
import { AgRichSelectValue } from "@ag-grid-community/core/dist/cjs/es5/widgets/agRichSelect";

export class RichSelectCellEditor extends PopupComponent implements ICellEditor {

    private params: IRichCellEditorParams;
    private focusAfterAttached: boolean;
    private startedByEnter: boolean = false;
    private richSelect: AgRichSelect;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

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

        this.focusAfterAttached = cellStartedEdit;

        if (_.exists(cellHeight)) {
            this.richSelect.setRowHeight(cellHeight);
        }
    }

    private buildRichSelectParams(): IRichSelectParams {
        const { value, values, colDef, formatValue } = this.params;
        const userCompDetails = this.userComponentFactory.getCellRendererDetails(this.params, {
            value,
            valueFormatted: formatValue(value),
            api: this.gridOptionsService.api
        } as ICellRendererParams);

        const ret: IRichSelectParams = {
            value: value,
            valueList: values,
            userCompDetails,
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
        // const selectedIndex = this.params.values.indexOf(this.selectedValue);

        const { focusAfterAttached, params } = this;

        this.richSelect.showPicker();

        if (focusAfterAttached) {
            this.richSelect.getFocusableElement().focus();
        }

        const { eventKey } = params;
        if (eventKey) {
            this.startedByEnter = eventKey === KeyCode.ENTER;
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
