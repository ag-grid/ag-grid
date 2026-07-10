import { _missing } from 'ag-stack';

import type {
    FieldPickerValueSelectedEvent,
    ICellEditorParams,
    KeyCreatorParams,
    RichCellEditorParams,
    RichCellEditorValuesCallbackParams,
    RichSelectParams,
} from 'ag-grid-community';
import { AgAbstractCellEditor, KeyCode, _addGridCommonParams, _consoleError } from 'ag-grid-community';

import { AgRichSelect } from '../widgets/agRichSelect';
import type { RichSelectAsyncValuesSource } from './richSelectAsyncRequestsFeature';

const DEFAULT_VALUES_PAGE_LOAD_THRESHOLD = 10;
type RichSelectValuesPageResult<TValue> = { values: TValue[]; lastRow?: number; cursor?: string | null };
type RichSelectAsyncMode = { isValuesPaged: boolean; isFullAsync: boolean };

export class RichSelectCellEditor<TData = any, TValue = any, TContext = any> extends AgAbstractCellEditor<
    any,
    TValue,
    TValue | TValue[]
> {
    protected override params: RichCellEditorParams<TData, TValue>;
    private focusAfterAttached: boolean;
    protected eEditor: AgRichSelect<TValue>;
    private pendingInitialEventKey: string | null = null;
    private initialEventKeyProcessed = false;
    /** Last raw input passed to `params.parseValue`. Initialised to `this` as an "uncached" sentinel — a DOM raw value can never equal the editor instance, so the first cache check always misses. */
    private cachedRaw: unknown = this;
    /** Memoised parse result for `cachedRaw`. Returned by `getValue()` when the raw input is unchanged across repeated validation/sync passes within an edit session. */
    private cachedParsed: any;

    constructor() {
        super({ tag: 'div', cls: 'ag-cell-edit-wrapper' });
    }

    public initialiseEditor(_params: RichCellEditorParams<TData, TValue>): void {
        const { cellStartedEdit, values, valuesPage, eventKey } = this.params;
        this.pendingInitialEventKey = null;
        this.initialEventKeyProcessed = false;

        if (_missing(values) && _missing(valuesPage)) {
            this.beans.log.warn(180);
        }

        const asyncMode = this.resolveAsyncMode();
        const { params: richSelectParams, valueList } = this.buildRichSelectParams(asyncMode);
        const richSelect = this.createManagedBean(new AgRichSelect<TValue>(richSelectParams));

        this.eEditor = richSelect;
        richSelect.addCss('ag-cell-editor');
        this.appendChild(richSelect);

        const asyncValuesSource = this.getAsyncValuesSource(asyncMode);
        if (asyncValuesSource) {
            richSelect.setAsyncValuesSource({
                source: asyncValuesSource,
                thresholdRows: this.params.valuesPageLoadThreshold ?? DEFAULT_VALUES_PAGE_LOAD_THRESHOLD,
                useAsyncSearch: asyncMode.isFullAsync,
                onMisconfiguredSearchSource: asyncMode.isFullAsync ? () => this.beans.log.warn(294) : undefined,
                onFirstValuesPageLoaded: () => {
                    if (this.pendingInitialEventKey != null) {
                        this.consumeInitialEventKey(this.pendingInitialEventKey);
                        this.pendingInitialEventKey = null;
                    }
                },
            });
        }

        this.eEditor.setValueList({ valueList, refresh: true, isInitial: true });

        if (asyncMode.isValuesPaged) {
            this.eEditor.resetAsyncValues('');
            if (asyncMode.isFullAsync) {
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

    private getPlaceholderText(isFullAsync = this.isFullAsync()): string {
        const { valuePlaceholder } = this.params;

        if (valuePlaceholder !== undefined) {
            return valuePlaceholder;
        }

        const translate = this.getLocaleTextFunc();

        return isFullAsync
            ? translate('typeToSearchOoo', 'Type to search...')
            : translate('advancedFilterBuilderSelectOption', 'Select an option...');
    }

    private isFullAsync(): boolean {
        const { allowTyping, filterListAsync, values, valuesPage } = this.params;
        const hasAsyncValueSource = typeof values === 'function' || typeof valuesPage === 'function';

        if (filterListAsync && !allowTyping) {
            this.beans.log.warn(294);
            return false;
        }

        if (!hasAsyncValueSource && filterListAsync) {
            this.beans.log.warn(294);
            return false;
        }

        return !!(allowTyping && filterListAsync && hasAsyncValueSource);
    }

    private isValuesPaged(): boolean {
        return typeof this.params.valuesPage === 'function';
    }

    private resolveAsyncMode(): RichSelectAsyncMode {
        return {
            isValuesPaged: this.isValuesPaged(),
            isFullAsync: this.isFullAsync(),
        };
    }

    private getInitialValueList(asyncMode: RichSelectAsyncMode = this.resolveAsyncMode()) {
        const params = this.params as RichCellEditorValuesCallbackParams<TData, TValue>;
        const { values } = params;

        if (asyncMode.isValuesPaged) {
            return;
        }

        if (!values) {
            return [];
        }

        if (Array.isArray(values)) {
            return values;
        }

        if (typeof values !== 'function') {
            return [];
        }

        if (asyncMode.isFullAsync) {
            // we never call values() with empty search string, even if initial
            return;
        }

        return values({ ...params });
    }

    private buildRichSelectParams(asyncMode: RichSelectAsyncMode = this.resolveAsyncMode()): {
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

        const { isValuesPaged, isFullAsync } = asyncMode;
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
            placeholder: this.getPlaceholderText(isFullAsync),
            initialInputValue: eventKey?.length === 1 ? eventKey : eventKey === KeyCode.BACKSPACE ? '' : undefined,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
        };

        const valueList = this.getInitialValueList(asyncMode);

        const isSync = Array.isArray(values);
        const isValuesCallback = typeof values === 'function';

        if (isValuesPaged) {
            if (valueList) {
                ret.valueList = valueList as TValue[];
            }
            if (isFullAsync) {
                ret.allowNoResultsCopy = true;
                ret.filterList = true; // force filterList when doing full async
            }
        } else if (isSync) {
            ret.valueList = valueList as any[];
            ret.searchStringCreator = this.getSearchStringCallback(valueList as any[]);
        } else if (isValuesCallback && isFullAsync) {
            ret.allowNoResultsCopy = true;
            ret.filterList = true; // force filterList when doing full async
        }

        return { params: ret, valueList };
    }

    private getAsyncValuesSource(
        asyncMode: RichSelectAsyncMode = this.resolveAsyncMode()
    ): RichSelectAsyncValuesSource<TValue> | undefined {
        const { isFullAsync, isValuesPaged } = asyncMode;

        if (!isFullAsync && !isValuesPaged) {
            return;
        }

        return {
            searchValues: isFullAsync ? (searchString: string) => this.getAsyncSearchValues(searchString) : undefined,
            loadValuesPage: isValuesPaged ? (request) => this.getAsyncValuesPage(request) : undefined,
            valuesPageInitialStartRow: isValuesPaged
                ? (searchString: string) => this.resolveValuesPageInitialStartRow(searchString)
                : undefined,
            valuesPageSize: isValuesPaged ? this.params.valuesPageSize : undefined,
        };
    }

    private getAsyncSearchValues(searchString: string): TValue[] | Promise<TValue[]> {
        const { values } = this.params as RichCellEditorValuesCallbackParams<TData, TValue>;
        if (typeof values !== 'function') {
            return [];
        }

        return values({
            ...(this.params as RichCellEditorValuesCallbackParams<TData, TValue>),
            search: searchString,
        });
    }

    private getAsyncValuesPage(request: {
        search: string;
        startRow: number;
        endRow: number;
        cursor?: string | null;
    }): RichSelectValuesPageResult<TValue> | Promise<RichSelectValuesPageResult<TValue>> {
        const { valuesPage } = this.params;
        if (typeof valuesPage !== 'function') {
            return { values: [] };
        }

        return valuesPage({
            ...this.params,
            search: request.search,
            startRow: request.startRow,
            endRow: request.endRow,
            cursor: request.cursor,
        });
    }

    private resolveValuesPageInitialStartRow(searchString: string): number {
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
            this.beans.log.warn(266);
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

                if (allowTyping && eventKey?.length !== 1) {
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

    public agSetEditValue(value: TValue | null | undefined): void {
        this.params.value = value;
        this.eEditor.setValue(value ?? null, true);
    }

    public getValue(): any {
        const value = this.eEditor.getValue();
        if (Object.is(this.cachedRaw, value)) {
            return this.cachedParsed;
        }
        const parsed = this.params.parseValue?.(value) ?? value;
        this.cachedRaw = value;
        this.cachedParsed = parsed;
        return parsed;
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
            cellEditorParams: params as ICellEditorParams<TData, TValue, TContext>,
        });
    }
}
