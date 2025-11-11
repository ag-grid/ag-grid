import type {
    FieldPickerValueSelectedEvent,
    ICellEditorParams,
    KeyCreatorParams,
    RichCellEditorParams,
    RichCellEditorValuesCallbackParams,
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
    private currentSearchRequest: number = 0;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
        this.onSearchCallbackDebounced = _debounce(
            this,
            this.onSearchCallback,
            this.params?.searchDebounceDelay ?? ON_SEARCH_CALLBACK_DEBOUNCE_DELAY
        );
    }

    public initialiseEditor(_params: RichCellEditorParams<TData, TValue>): void {
        const { cellStartedEdit, values } = this.params;

        if (_missing(values)) {
            _warn(180);
        }

        const { params: richSelectParams, valueList } = this.buildRichSelectParams();
        const richSelect = this.createManagedBean(new AgRichSelect<TValue>(richSelectParams));

        this.eEditor = richSelect;
        richSelect.addCss('ag-cell-editor');
        this.appendChild(richSelect);

        this.eEditor.setValueList({ valueList, refresh: true });
        const isPromise = valueList && !Array.isArray(valueList);
        if (isPromise) {
            valueList.then((values) => {
                const searchStringCallback = this.getSearchStringCallback(values);
                if (searchStringCallback) {
                    richSelect.setSearchStringCreator(searchStringCallback);
                }

                this.processEventKey(this.params.eventKey);
            });
        }

        this.addManagedListeners(richSelect, {
            fieldPickerValueSelected: this.onEditorPickerValueSelected.bind(this),
        });
        this.focusAfterAttached = cellStartedEdit;
    }

    private onEditorPickerValueSelected(e: FieldPickerValueSelectedEvent): void {
        // there is an issue with focus handling when we call `stopEditing` while the
        // picker list is still collapsing, so we make this call async to guarantee that.
        if (this.gos.get('editType') !== 'fullRow') {
            setTimeout(() => this.params.stopEditing(!e.fromEnterKey));
        }
    }

    private buildRichSelectParams(): { params: RichSelectParams<TValue>; valueList?: TValue[] | Promise<TValue[]> } {
        const params = this.params as RichCellEditorValuesCallbackParams<TData, TValue>;
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
        } = this.params;

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
            placeholder: valuePlaceholder ?? 'Select value...',
            initialInputValue: eventKey?.length === 1 ? eventKey : eventKey === KeyCode.BACKSPACE ? '' : undefined,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        };

        let valueList;

        if (filterListAsync && !filterList) {
            _warn(293);
        }

        const fullAsync = filterListAsync && filterList && allowTyping;

        if (typeof values === 'function') {
            if (fullAsync) {
                params.search = formatValue?.(value);
                ret.onSearch = this.onSearchCallbackDebounced;
                ret.allowNoResultsCopy = true;
            }
            valueList = values({ ...params });
        } else {
            valueList = values ?? [];
        }

        if (Array.isArray(valueList)) {
            ret.valueList = valueList;
            ret.searchStringCreator = this.getSearchStringCallback(valueList);
        } else {
            ret.isAsync = this.isAsync = true;
        }

        if (multiSelect && allowTyping) {
            params.allowTyping = ret.allowTyping = false;
            _warn(181);
        }

        return { params: ret, valueList };
    }

    private readonly onSearchCallback = (searchString: string): void => {
        const currentRequest = ++this.currentSearchRequest;
        this.eEditor.setValueList({ refresh: true, valueList: undefined }); // undefined removes any previous value list and also removes any label like 'No matches'
        const params = this.params as RichCellEditorValuesCallbackParams<TData, TValue>;

        params.search = searchString;
        if (!params.search) {
            return;
        }
        if (typeof params.values !== 'function') {
            // potentially allow sync values too
            return;
        }
        const valuesPromise = params.values(params);
        if (!Array.isArray(valuesPromise)) {
            this.eEditor.setValueList({
                valueList: valuesPromise.then((results) => {
                    // only set the results if this is the latest search request
                    if (currentRequest === this.currentSearchRequest) {
                        return results;
                    }
                }),
                refresh: true,
            });
        }
        // potentially allow sync values too
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
