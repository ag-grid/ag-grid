import type {
    FieldPickerValueSelectedEvent,
    ICellEditorParams,
    KeyCreatorParams,
    RichCellEditorParams,
    RichCellEditorValuesCallbackParams,
    RichCellEditorValuesPageParams,
    RichCellEditorValuesPageResult,
    RichSelectParams,
    _VerticalDirection,
} from 'ag-grid-community';
import { AgAbstractCellEditor, KeyCode, _addGridCommonParams, _consoleError, _missing, _warn } from 'ag-grid-community';

import { AgRichSelect } from '../widgets/agRichSelect';

const DEFAULT_VALUES_PAGE_SIZE = 100;
const DEFAULT_VALUES_PAGE_LOAD_THRESHOLD = 10;

export class RichSelectCellEditor<TData = any, TValue = any, TContext = any> extends AgAbstractCellEditor {
    protected override params: RichCellEditorParams<TData, TValue>;
    private focusAfterAttached: boolean;
    protected eEditor: AgRichSelect<TValue>;
    private currentSearchRequest: number = 0;
    private currentValuesPageRequest: number = 0;
    private valuesPageLoading = false;
    private valuesPageHasMoreNext = false;
    private valuesPageHasMorePrev = false;
    private valuesPageLoadedValues: TValue[] = [];
    private valuesPageSearch = '';
    private valuesPageWindowStartRow = 0;
    private valuesPageNextCursor: string | null | undefined;
    private pendingInitialEventKey: string | null = null;
    private initialEventKeyProcessed = false;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
    }

    public initialiseEditor(_params: RichCellEditorParams<TData, TValue>): void {
        const { cellStartedEdit, values, valuesPage, eventKey } = this.params;
        this.pendingInitialEventKey = null;
        this.initialEventKeyProcessed = false;

        if (_missing(values) && _missing(valuesPage)) {
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

        if (this.isValuesPaged()) {
            this.eEditor.setLoadMoreRowsCallback(
                (direction) => this.loadValuesPage(direction ?? 'down'),
                this.params.valuesPageLoadThreshold ?? DEFAULT_VALUES_PAGE_LOAD_THRESHOLD
            );
            this.resetValuesPage('');
            if (this.isFullAsync()) {
                this.consumeInitialEventKey(eventKey);
            } else {
                this.pendingInitialEventKey = eventKey;
            }
        } else if (valueList && !Array.isArray(valueList)) {
            valueList
                .then((values) => {
                    const searchStringCallback = this.getSearchStringCallback(values);
                    if (searchStringCallback) {
                        richSelect.setSearchStringCreator(searchStringCallback);
                    }

                    this.consumeInitialEventKey(eventKey);
                })
                .catch((error) => {
                    _consoleError('Rich Select', error);
                    this.consumeInitialEventKey(eventKey);
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
        const { allowTyping, filterListAsync, values, valuesPage } = this.params;
        const hasAsyncValueSource = typeof values === 'function' || typeof valuesPage === 'function';

        if (filterListAsync && !allowTyping) {
            _warn(294);
            return false;
        }

        if (!hasAsyncValueSource && filterListAsync) {
            _warn(294);
            return false;
        }

        return !!(allowTyping && filterListAsync && hasAsyncValueSource);
    }

    private isValuesPaged(): boolean {
        return typeof this.params.valuesPage === 'function';
    }

    private getInitialValueList() {
        const params = this.params as RichCellEditorValuesCallbackParams<TData, TValue>;
        const { values } = params;
        if (this.isValuesPaged()) {
            return;
        }
        const maybeItIsFullAsync = this.isFullAsync();
        const isSync = Array.isArray(values) || !values;
        const isSyncOrAsyncOrFullAsync = typeof values === 'function';

        if (isSync) {
            return values ?? [];
        }
        if (!isSyncOrAsyncOrFullAsync) {
            return [];
        }
        if (maybeItIsFullAsync) {
            // we never call values() with empty search string, even if initial
            return;
        }
        return values({ ...params });
    }

    private buildRichSelectParams(): {
        params: RichSelectParams<TValue>;
        valueList?: TValue[] | Promise<TValue[]>;
    } {
        const params = this.params;
        const {
            cellRenderer,
            cellRendererParams,
            cellHeight,
            value,
            values,
            valuesPage,
            formatValue,
            searchDebounceDelay,
            valueListGap,
            valueListMaxHeight,
            valueListMaxWidth,
            allowTyping,
            filterList,
            searchType,
            highlightMatch,
            eventKey,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        } = params;
        const formatValueFn = formatValue ?? ((value: TValue | null | undefined) => String(value ?? ''));
        const valueFormatter = (value: TValue | TValue[]): string => {
            if (Array.isArray(value)) {
                return value.map((currentValue) => formatValueFn(currentValue)).join(', ');
            }

            return formatValueFn(value as TValue | null | undefined);
        };

        const ret: RichSelectParams<TValue> = {
            value,
            cellRenderer,
            cellRendererParams,
            cellRowHeight: cellHeight,
            searchDebounceDelay,
            valueFormatter,
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

        const valueList = this.getInitialValueList();

        const isValuesPaged = typeof valuesPage === 'function';
        const maybeItIsFullAsync = this.isFullAsync();
        const isSync = Array.isArray(values);
        const isValuesCallback = typeof values === 'function';

        if (isValuesPaged) {
            if (valueList) {
                ret.valueList = valueList as TValue[];
            }
            if (maybeItIsFullAsync) {
                ret.onSearch = this.onSearchCallback;
                ret.allowNoResultsCopy = true;
                ret.filterList = true; // force filterList when doing full async
            }
        } else if (isSync) {
            ret.valueList = valueList as any[];
            ret.searchStringCreator = this.getSearchStringCallback(valueList as any[]);
        } else if (isValuesCallback && maybeItIsFullAsync) {
            ret.onSearch = this.onSearchCallback;
            ret.allowNoResultsCopy = true;
            ret.filterList = true; // force filterList when doing full async
        }

        return { params: ret, valueList };
    }

    private readonly onSearchCallback = (searchString: string): void => {
        if (this.isValuesPaged()) {
            this.resetValuesPage(searchString);
            return;
        }

        const currentRequest = ++this.currentSearchRequest;
        const richSelect = this.eEditor;
        richSelect.setValueList({ refresh: true, valueList: undefined }); // undefined removes any previous value list and also removes any label like 'No matches'
        const params = this.params as RichCellEditorValuesCallbackParams<TData, TValue>;

        if (!searchString) {
            // if search input is empty or has initial cell value, hide the picker
            // it is consistent with the requirement of not calling values() with empty search
            return;
        }

        if (typeof params.values !== 'function') {
            if (this.isFullAsync()) {
                _warn(294);
            }
            // should be impossible, but potentially allow sync values here
            return;
        }
        const callbackParams: RichCellEditorValuesCallbackParams<TData, TValue> = { ...params, search: searchString };
        let valuesPromise: TValue[] | Promise<TValue[]>;

        try {
            valuesPromise = params.values(callbackParams);
        } catch (error) {
            _consoleError('Rich Select', error);
            if (currentRequest === this.currentSearchRequest) {
                richSelect.setValueList({ refresh: true, valueList: [] });
            }
            return;
        }

        if (Array.isArray(valuesPromise)) {
            // this is only possible due to grid misconfiguration, in which case handle it gracefully
            if (this.isFullAsync()) {
                _warn(294);
            }
            richSelect.setValueList({ refresh: true, valueList: valuesPromise });
            return;
        }
        richSelect.setValueList({
            valueList: valuesPromise
                .then((results) => {
                    // only set the results if this is the latest search request
                    // this avoids out of order responses messing up the results
                    if (currentRequest === this.currentSearchRequest) {
                        return results;
                    }
                })
                .catch((error) => {
                    _consoleError('Rich Select', error);
                    if (currentRequest === this.currentSearchRequest) {
                        return [];
                    }
                }),
            refresh: true,
        });
    };

    private resetValuesPage(searchString: string): void {
        this.valuesPageSearch = searchString;
        this.valuesPageLoadedValues = [];
        this.valuesPageWindowStartRow = this.resolveValuesPageStartRow(searchString);
        this.valuesPageNextCursor = undefined;
        this.valuesPageHasMoreNext = true;
        this.valuesPageHasMorePrev = this.valuesPageWindowStartRow > 0;
        this.valuesPageLoading = false;
        this.currentValuesPageRequest++;

        this.eEditor.setValueList({ valueList: undefined, refresh: true, isInitial: true });
        this.loadValuesPage('down');
    }

    private loadValuesPage(direction: _VerticalDirection): void {
        const valuesPage = this.params.valuesPage;

        if (typeof valuesPage !== 'function' || this.valuesPageLoading) {
            return;
        }

        if (
            (direction === 'up' && !this.valuesPageHasMorePrev) ||
            (direction === 'down' && !this.valuesPageHasMoreNext)
        ) {
            return;
        }

        const pageSize = Math.max(this.params.valuesPageSize ?? DEFAULT_VALUES_PAGE_SIZE, 1);
        const startRow =
            direction === 'up'
                ? Math.max(this.valuesPageWindowStartRow - pageSize, 0)
                : this.valuesPageWindowStartRow + this.valuesPageLoadedValues.length;
        const endRow = direction === 'up' ? this.valuesPageWindowStartRow : startRow + pageSize;

        if (startRow >= endRow) {
            if (direction === 'up') {
                this.valuesPageHasMorePrev = false;
            } else {
                this.valuesPageHasMoreNext = false;
            }
            return;
        }

        const requestVersion = this.currentValuesPageRequest;
        const requestParams: RichCellEditorValuesPageParams<TData, TValue> = {
            ...this.params,
            search: this.valuesPageSearch,
            startRow,
            endRow,
            cursor: direction === 'down' ? this.valuesPageNextCursor : undefined,
        };

        this.valuesPageLoading = true;

        if (this.valuesPageLoadedValues.length === 0) {
            this.eEditor.setIsLoading();
        }

        let pageResultOrPromise:
            | RichCellEditorValuesPageResult<TValue>
            | Promise<RichCellEditorValuesPageResult<TValue>>;
        try {
            pageResultOrPromise = valuesPage(requestParams);
        } catch (error) {
            this.handleValuesPageError(error, requestVersion);
            return;
        }

        Promise.resolve(pageResultOrPromise)
            .then((pageResult) =>
                this.applyValuesPageResult(pageResult, pageSize, requestVersion, direction, startRow, endRow)
            )
            .catch((error) => this.handleValuesPageError(error, requestVersion));
    }

    private applyValuesPageResult(
        pageResult: RichCellEditorValuesPageResult<TValue> | undefined,
        pageSize: number,
        requestVersion: number,
        direction: _VerticalDirection,
        requestStartRow: number,
        requestEndRow: number
    ): void {
        if (requestVersion !== this.currentValuesPageRequest) {
            return;
        }

        this.valuesPageLoading = false;

        const isFirstLoadedPage = this.valuesPageLoadedValues.length === 0;
        const values = pageResult?.values ?? [];

        if (direction === 'up') {
            if (values.length) {
                this.valuesPageLoadedValues = [...values, ...this.valuesPageLoadedValues];
                this.valuesPageWindowStartRow = requestStartRow;
            }

            const expectedCount = requestEndRow - requestStartRow;
            this.valuesPageHasMorePrev = requestStartRow > 0 && values.length >= expectedCount;
        } else {
            if (values.length) {
                this.valuesPageLoadedValues = [...this.valuesPageLoadedValues, ...values];
            }

            this.valuesPageNextCursor = pageResult?.cursor;
            const loadedRowCount = this.valuesPageLoadedValues.length;

            if (typeof pageResult?.lastRow === 'number') {
                this.valuesPageHasMoreNext = this.valuesPageWindowStartRow + loadedRowCount < pageResult.lastRow;
            } else if (pageResult?.cursor !== undefined) {
                this.valuesPageHasMoreNext = !!pageResult.cursor;
            } else {
                this.valuesPageHasMoreNext = values.length >= pageSize;
            }
        }

        this.eEditor.setValueList({
            valueList: this.valuesPageLoadedValues,
            refresh: true,
            isInitial: true,
            scrollToCurrentValue: isFirstLoadedPage,
        });

        if (isFirstLoadedPage && this.pendingInitialEventKey != null) {
            this.consumeInitialEventKey(this.pendingInitialEventKey);
            this.pendingInitialEventKey = null;
        }
    }

    private handleValuesPageError(error: unknown, requestVersion: number): void {
        _consoleError('Rich Select', error);

        if (requestVersion !== this.currentValuesPageRequest) {
            return;
        }

        this.valuesPageLoading = false;
        this.valuesPageHasMoreNext = false;
        this.valuesPageHasMorePrev = false;
        this.eEditor.setValueList({ valueList: this.valuesPageLoadedValues, refresh: true, isInitial: true });
    }

    private resolveValuesPageStartRow(searchString: string): number {
        if (searchString) {
            return 0;
        }

        const { valuesPageInitialStartRow, value } = this.params;
        const startRow =
            typeof valuesPageInitialStartRow === 'function'
                ? valuesPageInitialStartRow(value)
                : valuesPageInitialStartRow;

        return Math.max(Math.floor(startRow ?? 0), 0);
    }

    private getSearchStringCallback(values: TValue[]): ((values: TValue[]) => string[]) | undefined {
        if (typeof values[0] !== 'object') {
            return;
        }

        const params = this.params;
        const { colDef, formatValue } = params;
        const formatValueFn = formatValue ?? ((value: TValue | null | undefined) => String(value ?? ''));

        if (colDef.cellEditorParams?.formatValue) {
            return (values: TValue[]) => values.map(formatValueFn);
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

        return (values: TValue[]) => values.map(formatValueFn);
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

            if (this.pendingInitialEventKey == null) {
                this.consumeInitialEventKey(eventKey);
            }
        });
    }

    private consumeInitialEventKey(eventKey: string | null | undefined): void {
        if (!eventKey || this.initialEventKeyProcessed) {
            return;
        }

        this.initialEventKeyProcessed = true;
        this.processEventKey(eventKey);
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
