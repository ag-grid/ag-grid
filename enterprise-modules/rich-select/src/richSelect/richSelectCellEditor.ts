import type {
    FieldPickerValueSelectedEvent,
    ICellEditor,
    ICellEditorParams,
    KeyCreatorParams,
    RichCellEditorParams,
    RichSelectParams,
} from '@ag-grid-community/core';
import { Events, PopupComponent, _exists, _missing, _warnOnce } from '@ag-grid-community/core';
import { AgRichSelect } from '@ag-grid-enterprise/core';

export class RichSelectCellEditor<TData = any, TValue = any> extends PopupComponent implements ICellEditor<TValue> {
    private params: RichCellEditorParams<TData, TValue>;
    private focusAfterAttached: boolean;
    private richSelect: AgRichSelect<TValue>;

    constructor() {
        super(/* html */ `<div class="ag-cell-edit-wrapper"></div>`);
    }

    public init(params: RichCellEditorParams<TData, TValue>): void {
        this.params = params;

        const { cellStartedEdit, cellHeight, values } = params;

        if (_missing(values)) {
            _warnOnce('agRichSelectCellEditor requires cellEditorParams.values to be set');
        }

        const { params: richSelectParams, valuesPromise } = this.buildRichSelectParams();

        this.richSelect = this.createManagedBean(new AgRichSelect<TValue>(richSelectParams));
        this.richSelect.addCssClass('ag-cell-editor');
        this.appendChild(this.richSelect);

        if (valuesPromise) {
            valuesPromise.then((values: TValue[]) => {
                this.richSelect.setValueList({ valueList: values, refresh: true });
                const searchStringCallback = this.getSearchStringCallback(values);
                if (searchStringCallback) {
                    this.richSelect.setSearchStringCreator(searchStringCallback);
                }
            });
        }

        this.addManagedListener(
            this.richSelect,
            Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            this.onEditorPickerValueSelected.bind(this)
        );
        this.addManagedListener(this.richSelect.getGui(), 'focusout', this.onEditorFocusOut.bind(this));

        this.focusAfterAttached = cellStartedEdit;

        if (_exists(cellHeight)) {
            this.richSelect.setRowHeight(cellHeight);
        }
    }

    private onEditorPickerValueSelected(e: FieldPickerValueSelectedEvent): void {
        this.params.stopEditing(!e.fromEnterKey);
    }

    private onEditorFocusOut(e: FocusEvent): void {
        if (this.richSelect.getGui().contains(e.relatedTarget as Element)) {
            return;
        }
        this.params.stopEditing(true);
    }

    private buildRichSelectParams(): { params: RichSelectParams<TValue>; valuesPromise?: Promise<TValue[]> } {
        const {
            cellRenderer,
            value,
            values,
            formatValue,
            searchDebounceDelay,
            valueListGap,
            valueListMaxHeight,
            valueListMaxWidth,
            allowTyping,
            filterList,
            searchType,
            highlightMatch,
            valuePlaceholder,
            eventKey,
        } = this.params;

        const ret: RichSelectParams = {
            value: value,
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
            placeholder: valuePlaceholder,
            initialInputValue: eventKey?.length === 1 ? eventKey : undefined,
        };

        let valuesResult;
        let valuesPromise;

        if (typeof values === 'function') {
            valuesResult = values(this.params as ICellEditorParams);
        } else {
            valuesResult = values ?? [];
        }

        if (Array.isArray(valuesResult)) {
            ret.valueList = valuesResult;
            ret.searchStringCreator = this.getSearchStringCallback(valuesResult);
        } else {
            valuesPromise = valuesResult;
        }

        return { params: ret, valuesPromise };
    }

    private getSearchStringCallback(values: TValue[]): ((values: TValue[]) => string[]) | undefined {
        const { colDef } = this.params;

        if (typeof values[0] !== 'object' || !colDef.keyCreator) {
            return;
        }

        return (values: TValue[]) =>
            values.map((value: TValue) => {
                const keyParams: KeyCreatorParams = this.gos.addGridCommonParams({
                    value: value,
                    colDef: this.params.colDef,
                    column: this.params.column,
                    node: this.params.node,
                    data: this.params.data,
                });
                return colDef.keyCreator!(keyParams);
            });
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void {
        const { focusAfterAttached, params } = this;

        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }

            if (focusAfterAttached) {
                const focusableEl = this.richSelect.getFocusableElement() as HTMLInputElement;
                focusableEl.focus();
                const { allowTyping, eventKey } = this.params;
                if (allowTyping && (!eventKey || eventKey.length !== 1)) {
                    focusableEl.select();
                }
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
