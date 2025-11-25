import type {
    FieldPickerValueSelectedEvent,
    ICellEditorParams,
    KeyCreatorParams,
    RichCellEditorParams,
    RichCellEditorValuesCallbackParams,
    RichSelectParams,
} from 'ag-grid-community';
import { AgAbstractCellEditor, KeyCode, _addGridCommonParams, _missing, _warn } from 'ag-grid-community';

import { AgRichSelect } from '../widgets/agRichSelect';

export class RichSelectCellEditor<TData = any, TValue = any, TContext = any> extends AgAbstractCellEditor {
    protected override params: RichCellEditorParams<TData, TValue>;
    private focusAfterAttached: boolean;
    protected eEditor: AgRichSelect<TValue>;
    private isAsync: boolean = false;
    private currentSearchRequest: number = 0;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
    }

    public initialiseEditor(_params: RichCellEditorParams<TData, TValue>): void {
        const { cellStartedEdit, values, eventKey } = this.params;

        if (_missing(values)) {
            _warn(180);
        }

        const { params: richSelectParams, valueList } = this.buildRichSelectParams();
        const richSelect = this.createManagedBean(new AgRichSelect<TValue>(richSelectParams));

        this.eEditor = richSelect;
        richSelect.addCss('ag-cell-editor');
        this.appendChild(richSelect);

        if (this.isFullAsync()) {
            richSelect.showPicker();
        }
        this.eEditor.setValueList({ valueList, refresh: true, isInitial: true });
        const isPromise = valueList && !Array.isArray(valueList);
        if (isPromise) {
            valueList.then((values) => {
                const searchStringCallback = this.getSearchStringCallback(values);
                if (searchStringCallback) {
                    richSelect.setSearchStringCreator(searchStringCallback);
                }

                this.processEventKey(eventKey);
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

    private getPlaceholderText(): string {
        const { valuePlaceholder } = this.params;

        if (valuePlaceholder !== undefined) {
            return valuePlaceholder;
        }
        const i18n = this.getLocaleTextFunc();
        return this.isFullAsync()
            ? i18n('typeToSearchOoo', 'Type to search...')
            : i18n('advancedFilterBuilderSelectOption', 'Select an option...');
    }

    private isFullAsync(): boolean {
        const { allowTyping, filterListAsync } = this.params;
        return !!(filterListAsync && allowTyping);
    }

    private buildRichSelectParams(): {
        params: RichSelectParams<TValue>;
        valueList?: TValue[] | Promise<TValue[]>;
    } {
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
            eventKey,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        } = params;

        const ret: RichSelectParams = {
            value,
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
            placeholder: this.getPlaceholderText(),
            initialInputValue: eventKey?.length === 1 ? eventKey : eventKey === KeyCode.BACKSPACE ? '' : undefined,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        };

        let valueList;

        const fullAsync = this.isFullAsync();
        if (filterListAsync && !fullAsync) {
            _warn(294);
        }

        if (typeof values === 'function') {
            if (fullAsync) {
                params.filterList = ret.filterList = true; // force filterList when doing full async
                params.search = formatValue?.(value);
                ret.onSearch = this.onSearchCallback;
                ret.allowNoResultsCopy = true;
            } else {
                // we never call values() with empty search string, even if initial
                valueList = values({ ...params });
            }
        } else {
            valueList = values ?? [];
        }

        if (Array.isArray(valueList)) {
            ret.valueList = valueList;
            ret.searchStringCreator = this.getSearchStringCallback(valueList);
        } else {
            this.isAsync = true;
        }

        if (multiSelect && allowTyping) {
            params.allowTyping = ret.allowTyping = false;
            _warn(181);
        }

        return { params: ret, valueList };
    }

    private readonly onSearchCallback = (searchString: string): void => {
        const currentRequest = ++this.currentSearchRequest;
        const richSelect = this.eEditor;
        richSelect.setValueList({ refresh: true, valueList: undefined }); // undefined removes any previous value list and also removes any label like 'No matches'
        const params = this.params as RichCellEditorValuesCallbackParams<TData, TValue>;

        params.search = searchString;
        if (!params.search) {
            // if search input is empty or has initial cell value, hide the picker
            // it is consistent with the requirement of not calling values() with empty search
            return;
        }

        if (typeof params.values !== 'function') {
            // potentially allow sync values too
            return;
        }
        const valuesPromise = params.values(params);
        if (Array.isArray(valuesPromise)) {
            // potentially allow sync values too
            return;
        }
        richSelect.setValueList({
            valueList: valuesPromise.then((results) => {
                // only set the results if this is the latest search request
                // this avoids out of order responses messing up the results
                if (currentRequest === this.currentSearchRequest) {
                    return results;
                }
            }),
            refresh: true,
        });
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
    // virtual row logic needs info about the gui state.
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
