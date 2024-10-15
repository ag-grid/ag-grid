import type {
    FieldPickerValueSelectedEvent,
    ICellEditor,
    ICellEditorParams,
    KeyCreatorParams,
    RichCellEditorParams,
    RichSelectParams,
} from 'ag-grid-community';
import { PopupComponent, _missing, _warn } from 'ag-grid-community';

import { AgRichSelect } from '../widgets/agRichSelect';

export class RichSelectCellEditor<TData = any, TValue = any> extends PopupComponent implements ICellEditor<TValue> {
    private params: RichCellEditorParams<TData, TValue>;
    private focusAfterAttached: boolean;
    private richSelect: AgRichSelect<TValue>;

    constructor() {
        super(/* html */ `<div class="ag-cell-edit-wrapper"></div>`);
    }

    public init(params: RichCellEditorParams<TData, TValue>): void {
        this.params = params;

        const { cellStartedEdit, values } = params;

        if (_missing(values)) {
            _warn(180);
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

        this.addManagedListeners(this.richSelect, {
            fieldPickerValueSelected: this.onEditorPickerValueSelected.bind(this),
        });
        this.focusAfterAttached = cellStartedEdit;
    }

    private onEditorPickerValueSelected(e: FieldPickerValueSelectedEvent): void {
        // there is an issue with focus handling when we call `stopEditing` while the
        // picker list is still collapsing, so we make this call async to guarantee that.
        setTimeout(() => this.params.stopEditing(!e.fromEnterKey));
    }

    private buildRichSelectParams(): { params: RichSelectParams<TValue>; valuesPromise?: Promise<TValue[]> } {
        const {
            cellRenderer,
            cellHeight,
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
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        } = this.params;

        const ret: RichSelectParams = {
            value: value,
            cellRenderer,
            cellRowHeight: cellHeight,
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
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
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

        if (multiSelect && allowTyping) {
            this.params.allowTyping = ret.allowTyping = false;
            _warn(181);
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

    public focusIn(): void {
        this.richSelect.getFocusableElement().focus();
    }

    public getValue(): any {
        return this.richSelect.getValue();
    }

    public override isPopup(): boolean {
        return false;
    }
}
