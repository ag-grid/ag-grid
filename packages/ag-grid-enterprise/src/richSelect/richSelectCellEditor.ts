import type {
    FieldPickerValueSelectedEvent,
    ICellEditorParams,
    KeyCreatorParams,
    RichCellEditorParams,
    RichCellEditorValuesCallback,
    RichSelectParams,
} from 'ag-grid-community';
import { AgAbstractCellEditor, KeyCode, _addGridCommonParams, _debounce, _missing, _warn } from 'ag-grid-community';

import { AgRichSelect } from '../widgets/agRichSelect';

const ON_SEARCH_CALLBACK_DEBOUNCE_DELAY = 300;
export class RichSelectCellEditor<TData = any, TValue = any, TContext = any> extends AgAbstractCellEditor {
    protected override params: RichCellEditorParams<TData, TValue>;
    private focusAfterAttached: boolean;
    protected eEditor: AgRichSelect<TValue>;
    private isAsync: boolean = false;
    private readonly onSearchCallbackDebounced;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
        this.onSearchCallbackDebounced = _debounce(this, this.onSearchCallback, ON_SEARCH_CALLBACK_DEBOUNCE_DELAY);
    }

    public initialiseEditor(_params: RichCellEditorParams<TData, TValue>): void {
        const { cellStartedEdit, values } = this.params;

        if (_missing(values)) {
            _warn(180);
        }

        const { params: richSelectParams, valuesPromise } = this.buildRichSelectParams();
        const richSelect = this.createManagedBean(new AgRichSelect<TValue>(richSelectParams));

        this.eEditor = richSelect;
        richSelect.addCss('ag-cell-editor');
        this.appendChild(richSelect);

        if (valuesPromise) {
            this.onValuesPromise(valuesPromise);
        }

        this.addManagedListeners(richSelect, {
            fieldPickerValueSelected: this.onEditorPickerValueSelected.bind(this),
        });
        this.focusAfterAttached = cellStartedEdit;
    }

    private readonly onValuesPromise = (valuesPromise: Promise<TValue[]>) => {
        this.isAsync = true;
        const richSelect = this.eEditor;
        void richSelect.setValueListAsync({ valueList: valuesPromise, refresh: true });
        void valuesPromise.then((values) => {
            const searchStringCallback = this.getSearchStringCallback(values);
            if (searchStringCallback) {
                richSelect.setSearchStringCreator(searchStringCallback);
            }

            this.processEventKey(this.params.eventKey);
        });
    };

    private onEditorPickerValueSelected(e: FieldPickerValueSelectedEvent): void {
        // there is an issue with focus handling when we call `stopEditing` while the
        // picker list is still collapsing, so we make this call async to guarantee that.
        if (this.gos.get('editType') !== 'fullRow') {
            setTimeout(() => this.params.stopEditing(!e.fromEnterKey));
        }
    }

    private buildRichSelectParams(): { params: RichSelectParams<TValue>; valuesPromise?: Promise<TValue[]> } {
        const params = this.params;
        const {
            cellRenderer,
            cellRendererParams,
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
            filterListAsync,
            searchType,
            highlightMatch,
            valuePlaceholder,
            eventKey,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        } = params;

        const ret: RichSelectParams = {
            value: value,
            cellRenderer,
            cellRendererParams,
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
            initialInputValue: eventKey?.length === 1 ? eventKey : eventKey === KeyCode.BACKSPACE ? '' : undefined,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        };

        let valuesResult;
        let valuesPromise;

        if (typeof values === 'function') {
            valuesResult = values(params as ICellEditorParams);
        } else {
            valuesResult = values ?? [];
        }

        if (Array.isArray(valuesResult)) {
            ret.valueList = valuesResult;
            ret.searchStringCreator = this.getSearchStringCallback(valuesResult);
        } else {
            valuesPromise = valuesResult;
        }

        if (allowTyping && filterListAsync) {
            // no warn here, as this is a historical behaviour which weirdly works, but no users complained
            if (filterList && valuesPromise) {
                ret.onSearch = this.onSearchCallbackDebounced;
            } else {
                params.filterListAsync = false;
                _warn(293);
            }
        }

        if (multiSelect && allowTyping) {
            params.allowTyping = ret.allowTyping = false;
            _warn(181);
        }

        return { params: ret, valuesPromise };
    }

    private readonly onSearchCallback = (searchString: string): void => {
        this.eEditor.setValueList({ refresh: true, valueList: [] });
        const params = this.params;
        const valuesCb = params.values as RichCellEditorValuesCallback<TData, TValue>;
        const valuesPromise = valuesCb(params as ICellEditorParams, searchString);
        if (!Array.isArray(valuesPromise)) {
            this.onValuesPromise(valuesPromise);
        }
    };

    private getSearchStringCallback(values: TValue[]): ((values: TValue[]) => string[]) | undefined {
        if (typeof values[0] !== 'object') {
            return;
        }

        const params = this.params;
        const { colDef, formatValue } = params;

        if (colDef.cellEditorParams?.formatValue) {
            return (values: TValue[]) => values.map(formatValue!);
        }

        const { keyCreator } = colDef;
        if (keyCreator) {
            _warn(266);
            const { column, node, data } = params;
            return (values: TValue[]) =>
                values.map((value: TValue) => {
                    const keyParams: KeyCreatorParams = _addGridCommonParams(this.gos, {
                        value,
                        colDef,
                        column,
                        node,
                        data,
                    });
                    return keyCreator(keyParams);
                });
        }

        return (values: TValue[]) => values.map(formatValue!);
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void {
        const { focusAfterAttached, params } = this;

        setTimeout(() => {
            if (!this.isAlive()) {
                return;
            }

            const richSelect = this.eEditor;
            const { allowTyping, eventKey, cellStartedEdit } = params;

            if (focusAfterAttached) {
                const focusableEl = richSelect.getFocusableElement() as HTMLInputElement;
                focusableEl.focus();

                if (allowTyping && (!eventKey || eventKey.length !== 1)) {
                    focusableEl.select();
                }
            }

            if (cellStartedEdit) {
                richSelect.showPicker();
            }

            if (!this.isAsync) {
                this.processEventKey(eventKey);
            }
        });
    }

    private processEventKey(eventKey: string | null) {
        if (!eventKey) {
            return;
        }

        if (eventKey === KeyCode.BACKSPACE) {
            this.eEditor.searchTextFromString(null);
        } else if (eventKey?.length === 1) {
            this.eEditor.searchTextFromString(eventKey);
        }
    }

    public focusIn(): void {
        this.eEditor.getFocusableElement().focus();
    }

    public getValue(): any {
        const { params } = this;
        const value = this.eEditor.getValue();

        return params.parseValue?.(value) ?? value;
    }

    public override isPopup(): boolean {
        return false;
    }

    public getValidationElement() {
        return this.eEditor.getAriaElement() as HTMLElement;
    }

    public getValidationErrors() {
        const { params } = this;
        const { getValidationErrors } = params;

        if (!getValidationErrors) {
            return null;
        }

        return getValidationErrors({
            value: this.getValue(),
            internalErrors: null,
            cellEditorParams: params as unknown as ICellEditorParams<TData, TValue, TContext>,
        });
    }
}
