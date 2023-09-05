import {
    AgRichSelect,
    Events,
    ICellEditor,
    KeyCreatorParams,
    RichSelectParams,
    PopupComponent,
    FieldPickerValueSelectedEvent,
    RichCellEditorParams,
    _
} from "@ag-grid-community/core";

export class RichSelectCellEditor<TData = any, TValue = any> extends PopupComponent implements ICellEditor<TValue> {

    private params: RichCellEditorParams<TData, TValue>;
    private focusAfterAttached: boolean;
    private richSelect: AgRichSelect<TValue>;

    constructor() {
        super(/* html */ 
            `<div class="ag-cell-edit-wrapper"></div>`
        );
    }

    public init(params: RichCellEditorParams<TData, TValue>): void {
        this.params = params;

        const  { cellStartedEdit, values, cellHeight } = params;

        if (_.missing(values)) {
            console.warn('AG Grid: richSelectCellEditor requires values for it to work');
            return;
        }

        const richSelectParams = this.buildRichSelectParams();

        this.richSelect = this.createManagedBean(new AgRichSelect<TValue>(richSelectParams));
        this.appendChild(this.richSelect);

        this.addManagedListener(this.richSelect, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, this.onEditorPickerValueSelected.bind(this));
        this.addManagedListener(this.richSelect.getGui(), 'focusout', this.onEditorFocusOut.bind(this));

        this.focusAfterAttached = cellStartedEdit;

        if (_.exists(cellHeight)) {
            this.richSelect.setRowHeight(cellHeight);
        }
    }

    private onEditorPickerValueSelected(e: FieldPickerValueSelectedEvent<TData>): void {
        this.params.stopEditing(!e.fromEnterKey);
    }

    private onEditorFocusOut(e: FocusEvent): void {
        if (this.richSelect.getGui().contains(e.relatedTarget as Element)) { return; }
        this.params.stopEditing(true);
    }

    private buildRichSelectParams(): RichSelectParams<TValue> {
        const { 
            cellRenderer, value, values, colDef, 
            formatValue, searchDebounceDelay, valueListGap,
            valueListMaxHeight, valueListMaxWidth, allowTyping,
            filterList, searchType, highlightMatch, valuePlaceholder
        } = this.params;

        const ret: RichSelectParams = {
            value: value,
            valueList: values,
            cellRenderer,
            searchDebounceDelay,
            valueFormatter: formatValue,
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'virtual-list',
            pickerGap: valueListGap,
            allowTyping,
            filterList,
            searchType,
            highlightMatch,
            maxPickerHeight: valueListMaxHeight,
            maxPickerWidth: valueListMaxWidth,
            placeholder: valuePlaceholder
        }

        if (typeof values[0] === 'object' && colDef.keyCreator) {
            ret.searchStringCreator = (values: TValue[]) => values.map((value: TValue) => {
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

        setTimeout(() => {
            if (!this.isAlive()) { return; }

            if (focusAfterAttached) {
                this.richSelect.getFocusableElement().focus();
            }
    
            this.richSelect.showPicker();
    
            const { eventKey } = params;
            if (eventKey) {
                if (eventKey?.length === 1) {
                    this.richSelect.searchTextFromString(eventKey);
                }
            }

        });
    }

    public getValue(): any {
        return this.richSelect.getValue();
    }

    public isPopup(): boolean {
        return false;
    }

}
