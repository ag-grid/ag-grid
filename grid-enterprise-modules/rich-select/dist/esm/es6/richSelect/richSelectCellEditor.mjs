import { AgRichSelect, Events, PopupComponent, _ } from "@ag-grid-community/core";
export class RichSelectCellEditor extends PopupComponent {
    constructor() {
        super(/* html */ `<div class="ag-cell-edit-wrapper"></div>`);
    }
    init(params) {
        this.params = params;
        const { cellStartedEdit, values, cellHeight } = params;
        if (_.missing(values)) {
            console.warn('AG Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        const richSelectParams = this.buildRichSelectParams();
        this.richSelect = this.createManagedBean(new AgRichSelect(richSelectParams));
        this.appendChild(this.richSelect);
        this.addManagedListener(this.richSelect, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, this.onEditorPickerValueSelected.bind(this));
        this.addManagedListener(this.richSelect.getGui(), 'focusout', this.onEditorFocusOut.bind(this));
        this.focusAfterAttached = cellStartedEdit;
        if (_.exists(cellHeight)) {
            this.richSelect.setRowHeight(cellHeight);
        }
    }
    onEditorPickerValueSelected(e) {
        this.params.stopEditing(!e.fromEnterKey);
    }
    onEditorFocusOut(e) {
        if (this.richSelect.getGui().contains(e.relatedTarget)) {
            return;
        }
        this.params.stopEditing(true);
    }
    buildRichSelectParams() {
        const { cellRenderer, value, values, colDef, formatValue, searchDebounceDelay, valueListGap } = this.params;
        const ret = {
            value: value,
            valueList: values,
            cellRenderer,
            searchDebounceDelay,
            valueFormatter: formatValue,
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'virtual-list',
        };
        if (valueListGap != null) {
            ret.pickerGap = valueListGap;
        }
        if (typeof values[0] === 'object' && colDef.keyCreator) {
            ret.searchStringCreator = (values) => values.map((value) => {
                const keyParams = {
                    value: value,
                    colDef: this.params.colDef,
                    column: this.params.column,
                    node: this.params.node,
                    data: this.params.data,
                    api: this.gridOptionsService.api,
                    columnApi: this.gridOptionsService.columnApi,
                    context: this.gridOptionsService.context
                };
                return colDef.keyCreator(keyParams);
            });
        }
        return ret;
    }
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    afterGuiAttached() {
        const { focusAfterAttached, params } = this;
        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }
            if (focusAfterAttached) {
                this.richSelect.getFocusableElement().focus();
            }
            this.richSelect.showPicker();
            const { eventKey } = params;
            if (eventKey) {
                if ((eventKey === null || eventKey === void 0 ? void 0 : eventKey.length) === 1) {
                    this.richSelect.searchText(eventKey);
                }
            }
        });
    }
    getValue() {
        return this.richSelect.getValue();
    }
    isPopup() {
        return false;
    }
}
