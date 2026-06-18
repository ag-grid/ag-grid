import type { IAriaAnnouncementService, VerticalDirection } from 'ag-stack';
import {
    RefPlaceholder,
    _addOrRemoveAttribute,
    _clearElement,
    _debounce,
    _exists,
    _fuzzySuggestions,
    _getActiveDomElement,
    _isElementOverflowingCallback,
    _isEventFromPrintableCharacter,
    _isVisible,
    _setAriaActiveDescendant,
    _setScrollLeft,
} from 'ag-stack';

import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    AgPromise,
    BeanCollection,
    ElementParams,
    FieldPickerValueSelectedEvent,
    GridInputTextField,
    GridOptionsService,
    GridOptionsWithDefaults,
    ICellRendererComp,
    IRichCellEditorRendererParams,
    ITooltipCtrl,
    Registry,
    RichSelectListRowSelectedEvent,
    RichSelectParams,
    TooltipFeature,
    UserCompDetails,
    UserComponentFactory,
    WithoutGridCommon,
} from 'ag-grid-community';
import {
    AgInputTextFieldSelector,
    AgPickerField,
    KeyCode,
    _addGridCommonParams,
    _clamp,
    _createIconNoSpan,
    _getEditorRendererDetails,
    _stopPropagationForAgGrid,
} from 'ag-grid-community';

import type {
    RichSelectAsyncRequestsFeature,
    RichSelectAsyncValuesSource,
} from '../richSelect/richSelectAsyncRequestsFeature';
import { createRichSelectAsyncRequestBindings } from '../richSelect/richSelectAsyncRequestsFeature';
import { AgPillContainer } from './AgPillContainer';
import agRichSelectCSS from './agRichSelect.css';
import type { AgRichSelectListEvent } from './agRichSelectList';
import { AgRichSelectList } from './agRichSelectList';

const ON_SEARCH_CALLBACK_DEBOUNCE_DELAY = 300;
type AgRichSelectEvent = AgRichSelectListEvent;

const AgRichSelectElement: ElementParams = {
    tag: 'div',
    cls: 'ag-picker-field',
    role: 'presentation',
    children: [
        { tag: 'div', ref: 'eLabel' },
        {
            tag: 'div',
            ref: 'eWrapper',
            cls: 'ag-wrapper ag-picker-field-wrapper ag-rich-select-value ag-picker-collapsed',
            children: [
                { tag: 'span', ref: 'eDisplayField', cls: 'ag-picker-field-display' },
                { tag: 'ag-input-text-field', ref: 'eInput', cls: 'ag-rich-select-field-input' },
                {
                    tag: 'span',
                    ref: 'eDeselect',
                    cls: 'ag-rich-select-deselect-button ag-picker-field-icon',
                    role: 'presentation',
                },
                { tag: 'span', ref: 'eIcon', cls: 'ag-picker-field-icon', attrs: { 'aria-hidden': 'true' } },
            ],
        },
    ],
};
export class AgRichSelect<TValue = any> extends AgPickerField<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    TValue[] | TValue | null,
    RichSelectParams<TValue>,
    AgRichSelectEvent,
    AgRichSelectList<TValue, AgRichSelectEvent>
> {
    private userCompFactory: UserComponentFactory;
    private ariaAnnounce?: IAriaAnnouncementService;
    private registry: Registry;
    private onSearchCallbackDebounced?: (searchString: string) => void;

    public wireBeans(beans: BeanCollection) {
        this.userCompFactory = beans.userCompFactory;
        this.ariaAnnounce = beans.ariaAnnounce;
        this.registry = beans.registry;
    }

    private searchStrings?: string[];
    private searchString = '';
    private listComponent: AgRichSelectList<TValue> | undefined;
    private pillContainer: AgPillContainer<TValue> | null;
    protected values: TValue[] | undefined;
    private loadMoreRowsCallback?: (direction?: VerticalDirection) => void;
    private loadMoreRowsThreshold = 10;
    private asyncRequests?: RichSelectAsyncRequestsFeature<TValue>;
    private hasPagedAsyncSource = false;

    private searchStringCreator: ((values: TValue[]) => string[]) | null = null;
    private readonly eInput: GridInputTextField = RefPlaceholder;
    private readonly eDeselect: HTMLSpanElement = RefPlaceholder;

    private ariaToggleSelection: string;
    private ariaDeselectAllItems: string;
    private ariaDeleteSelection: string;
    private skipWrapperAnnouncement?: boolean = false;
    private tooltipFeature?: TooltipFeature;
    private shouldDisplayTooltip?: () => boolean;
    private readonly valueFormatter: (value: TValue | TValue[] | null | undefined) => string;

    constructor(config?: RichSelectParams<TValue>) {
        const valueFormatter = resolveRichSelectValueFormatter<TValue>(config?.valueFormatter);
        const resolvedAgComponents = config?.agComponents?.includes(AgInputTextFieldSelector)
            ? config.agComponents
            : [AgInputTextFieldSelector, ...(config?.agComponents ?? [])];

        super({
            ...config,
            // prevents undefined values from being passed to the picker which can cause
            // issues with the list component's value selection and highlighting logic
            pickerAriaLabelKey: config?.pickerAriaLabelKey ?? 'ariaLabelRichSelectField',
            pickerAriaLabelValue: config?.pickerAriaLabelValue ?? 'Rich Select Field',
            pickerType: config?.pickerType ?? 'ag-list',
            className: config?.className ?? 'ag-rich-select',
            pickerIcon: config?.pickerIcon ?? 'richSelectOpen',
            ariaRole: config?.ariaRole ?? 'combobox',
            template: config?.template ?? AgRichSelectElement,
            agComponents: resolvedAgComponents,
            modalPicker: config?.modalPicker ?? false,
            valueFormatter,
            maxPickerHeight: config?.maxPickerHeight ?? 'calc(var(--ag-row-height) * 6.5)',
        });
        this.valueFormatter = valueFormatter;

        const { value, valueList, searchStringCreator, onSearch } = config ?? {};

        if (value !== undefined) {
            this.value = value;
        }

        if (searchStringCreator) {
            this.searchStringCreator = searchStringCreator;
        }

        if (valueList != null) {
            this.setValueList({ valueList, isInitial: true });
        }

        const { searchDebounceDelay = ON_SEARCH_CALLBACK_DEBOUNCE_DELAY } = this.config;
        if (onSearch) {
            this.onSearchCallbackDebounced = _debounce(this, onSearch, searchDebounceDelay);
        }
        this.registerCSS(agRichSelectCSS);
    }

    public override postConstruct(): void {
        this.tooltipFeature = this.createOptionalManagedBean(
            this.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, {
                getGui: () => this.getGui(),
                shouldDisplayTooltip: () => this.shouldDisplayTooltip?.() ?? true,
            } as ITooltipCtrl)
        );
        super.postConstruct();
        this.createListComponent();
        this.eDeselect.appendChild(_createIconNoSpan('richSelectRemove', this.beans)!);

        const { allowTyping, placeholder, multiSelect, suppressDeselectAll, suppressMultiSelectPillRenderer } =
            this.config;

        this.eDeselect.classList.add('ag-hidden');

        if (allowTyping) {
            this.eInput.setAutoComplete(false).setInputPlaceholder(placeholder);
            if (!multiSelect) {
                this.eDisplayField.classList.add('ag-hidden');
            } else {
                this.eWrapper.classList.add('ag-rich-select-typing-multi');
                if (!suppressMultiSelectPillRenderer) {
                    this.eDisplayField.classList.add('ag-rich-select-pill-display');
                }
            }
        } else {
            this.eInput.setDisplayed(false);
        }

        this.setupAriaProperties();

        const { searchDebounceDelay = 300 } = this.config;
        this.clearSearchString = _debounce(this, this.clearSearchString.bind(this), searchDebounceDelay);

        this.renderSelectedValue();

        if (allowTyping) {
            this.eInput.onValueChange((value) => {
                this.openPickerOnTypingIfNeeded(value);
                this.updateTypingMultiSelectPlaceholder(value);
                this.searchTextFromString(value);
            });
        }

        this.addManagedElementListeners(this.eWrapper, { focus: this.onWrapperFocus.bind(this) });
        this.addManagedElementListeners(this.eWrapper, { focusout: this.onWrapperFocusOut.bind(this) });

        if (!suppressDeselectAll) {
            this.addManagedElementListeners(this.eDeselect, {
                mousedown: this.onDeselectAllMouseDown.bind(this),
                click: this.onDeselectAllClick.bind(this),
            });
        }
    }

    private setupAriaProperties(): void {
        const { eWrapper, gos } = this;

        eWrapper.tabIndex = gos.get('tabIndex');

        const translate = this.getLocaleTextFunc();
        this.ariaDeleteSelection = translate('ariaLabelRichSelectDeleteSelection', 'Press DELETE to deselect item');
        this.ariaDeselectAllItems = translate(
            'ariaLabelRichSelectDeselectAllItems',
            'Press DELETE to deselect all items'
        );
        this.ariaToggleSelection = translate('ariaLabelRichSelectToggleSelection', 'Press SPACE to toggle selection');
    }

    private createListComponent(): void {
        this.listComponent = this.createBean(
            new AgRichSelectList<TValue>(this.config, this.getFocusableElement(), () => this.searchString)
        );
        this.listComponent.setLoadMoreRowsCallback(this.loadMoreRowsCallback, this.loadMoreRowsThreshold);
        this.listComponent.setStateAnnouncementCallback((value: string) => this.announceAriaValue(value));
        this.listComponent.setParentComponent(this);

        this.addManagedListeners(this.listComponent, {
            richSelectListRowSelected: (e: RichSelectListRowSelectedEvent) => {
                this.onListValueSelected(e.value, e.fromEnterKey);
            },
        });
    }

    private renderSelectedValue(fromPicker?: boolean): void {
        const { value, eDisplayField, config, gos } = this;
        const {
            allowTyping,
            cellRenderer,
            cellRendererParams,
            initialInputValue,
            multiSelect,
            suppressDeselectAll,
            suppressMultiSelectPillRenderer,
            onSearch,
        } = config;

        const valueFormatted = this.valueFormatter(value);
        const isTypingMultiSelect = !!(allowTyping && multiSelect);

        if (allowTyping) {
            /**
             * Suppress event in full async mode when item is selected to prevent redundant async filtering call for valid options.
             */
            const inputValue = isTypingMultiSelect
                ? (initialInputValue ?? this.eInput.getValue() ?? '')
                : (initialInputValue ?? (value === '' ? '' : valueFormatted));
            this.eInput.setValue(inputValue, !!fromPicker && !!onSearch);

            if (!isTypingMultiSelect) {
                return;
            }

            this.updateTypingMultiSelectPlaceholder(inputValue);
        }

        if (multiSelect && !suppressDeselectAll) {
            const isEmpty = value == null || (Array.isArray(value) && value.length === 0);
            this.eDeselect.classList.toggle('ag-hidden', isEmpty);
        }

        let userCompDetails: UserCompDetails | undefined;

        if (multiSelect && !suppressMultiSelectPillRenderer) {
            this.createOrUpdatePillContainer(eDisplayField);
            return;
        }

        if (cellRenderer && !allowTyping) {
            userCompDetails = _getEditorRendererDetails<RichSelectParams, IRichCellEditorRendererParams<TValue>>(
                this.userCompFactory,
                config,
                _addGridCommonParams(this.gos, {
                    value,
                    valueFormatted,
                    cellRendererParams,
                    getValue: () => this.getValue(),
                    setValue: (value: TValue[] | TValue | null) => {
                        this.setValue(value, true);
                    },
                    setTooltip: (value: string, shouldDisplayTooltip: () => boolean) => {
                        gos.assertModuleRegistered('Tooltip', 3);
                        this.shouldDisplayTooltip = shouldDisplayTooltip;
                        this.tooltipFeature?.setTooltipAndRefresh(value);
                    },
                })
            );
        }

        let userCompDetailsPromise: AgPromise<any> | undefined;

        if (userCompDetails) {
            userCompDetailsPromise = userCompDetails.newAgStackInstance();
        }

        if (userCompDetailsPromise) {
            _clearElement(eDisplayField);
            _bindCellRendererToHtmlElement(userCompDetailsPromise, eDisplayField);
            userCompDetailsPromise.then((renderer) => {
                this.addDestroyFunc(() => this.destroyBean(renderer));
            });
        } else {
            if (value != null) {
                // eslint-disable-next-line no-restricted-properties -- Could swap to textContent, but could be a breaking change
                eDisplayField.innerText = valueFormatted;
                eDisplayField.classList.remove('ag-display-as-placeholder');
            } else {
                const { placeholder } = config;
                if (_exists(placeholder)) {
                    eDisplayField.textContent = placeholder;
                    eDisplayField.classList.add('ag-display-as-placeholder');
                } else {
                    _clearElement(eDisplayField);
                }
            }

            this.shouldDisplayTooltip = _isElementOverflowingCallback(() => this.eDisplayField);
            this.tooltipFeature?.setTooltipAndRefresh(valueFormatted ?? null);
        }
    }

    protected createPickerComponent() {
        const { values } = this;

        if (values) {
            this.setValueList({ valueList: values });
        }

        // do not create the picker every time to save state
        return this.listComponent!;
    }

    public setSearchStringCreator(searchStringFn: (values: TValue[]) => string[]): void {
        this.searchStringCreator = searchStringFn;
    }

    public setAsyncValuesSource(params: {
        source: RichSelectAsyncValuesSource<TValue>;
        thresholdRows?: number;
        useAsyncSearch?: boolean;
        onMisconfiguredSearchSource?: () => void;
        onFirstValuesPageLoaded?: () => void;
    }): void {
        const { source, thresholdRows, useAsyncSearch, onMisconfiguredSearchSource, onFirstValuesPageLoaded } = params;
        this.asyncRequests?.destroy();

        const asyncRequestBindings = createRichSelectAsyncRequestBindings<TValue>({
            host: {
                setValueList: (valueListParams) => this.setValueList(valueListParams),
                setIsLoading: () => this.setIsLoading(),
            },
            source,
            useAsyncSearch,
            onMisconfiguredSearchSource,
            onFirstValuesPageLoaded,
        });

        this.asyncRequests = asyncRequestBindings.controller;
        this.hasPagedAsyncSource = asyncRequestBindings.hasPagedSource;

        if (asyncRequestBindings.onSearch) {
            const { searchDebounceDelay = ON_SEARCH_CALLBACK_DEBOUNCE_DELAY } = this.config;
            this.onSearchCallbackDebounced = _debounce(this, asyncRequestBindings.onSearch, searchDebounceDelay);
        } else if (!this.config.onSearch) {
            this.onSearchCallbackDebounced = undefined;
        }

        this.setLoadMoreRowsCallback(asyncRequestBindings.onLoadMoreRows, thresholdRows ?? this.loadMoreRowsThreshold);
    }

    public resetAsyncValues(searchString = ''): void {
        if (!this.hasPagedAsyncSource) {
            return;
        }
        this.asyncRequests?.resetValuesPage(searchString);
    }

    public setLoadMoreRowsCallback(callback?: (direction?: VerticalDirection) => void, thresholdRows = 10): void {
        this.loadMoreRowsCallback = callback;
        this.loadMoreRowsThreshold = Math.max(thresholdRows, 1);
        this.listComponent?.setLoadMoreRowsCallback(this.loadMoreRowsCallback, this.loadMoreRowsThreshold);
    }

    public setIsLoading(): void {
        this.listComponent?.setIsLoading();
    }

    private setValueListInternal(params: {
        valueList: TValue[] | undefined;
        refresh?: boolean;
        isInitial?: boolean;
        scrollToCurrentValue?: boolean;
        prependedRowCount?: number;
    }): void {
        const { listComponent, isPickerDisplayed, value } = this;
        const { valueList, refresh, isInitial, scrollToCurrentValue = true, prependedRowCount = 0 } = params;
        if (isInitial) {
            this.setValues(valueList);
        }
        if (!listComponent) {
            return;
        }

        const previousScrollTop = prependedRowCount > 0 ? listComponent.getScrollTop() : undefined;

        if (prependedRowCount > 0) {
            listComponent.offsetHoveredIndexOnPrependedRows(prependedRowCount);
        }

        // we need to update the list component even if the 'values' is undefined
        listComponent.setCurrentList(valueList);

        if (!refresh) {
            return;
        }

        if (isPickerDisplayed && previousScrollTop != null && prependedRowCount > 0) {
            listComponent.restoreScrollOnPrependedRows?.(previousScrollTop, prependedRowCount);
        }

        if (this.values) {
            listComponent.refresh(true);
            const hasCurrentValueInLoadedList = value != null && listComponent.getIndicesForValues(value).length > 0;
            if (isPickerDisplayed && hasCurrentValueInLoadedList && scrollToCurrentValue) {
                listComponent.selectValue(value);
            }
        } else if (isPickerDisplayed) {
            const hasRefreshed = listComponent.selectValue(value);
            if (!hasRefreshed) {
                listComponent.refresh();
            }
        }
        this.alignPickerToComponent();
    }

    public setValueList(params: {
        valueList: TValue[] | Promise<TValue[] | undefined> | undefined;
        refresh?: boolean;
        isInitial?: boolean;
        scrollToCurrentValue?: boolean;
        prependedRowCount?: number;
    }): void {
        const { valueList } = params;

        if (!valueList || Array.isArray(valueList)) {
            // If valueList is an array, null or undefined, apply it synchronously.
            // This lets us immediately clear the existing list and hide any status label.
            // Useful for async searches where previous results must be removed so a
            // placeholder/CTA (e.g. `Start typing...`) is shown until new results arrive.
            this.setValueListInternal(params as any);
            return;
        }

        this.listComponent?.setIsLoading();
        valueList
            .then((values) => {
                if (values !== undefined) {
                    this.setValueListInternal({ ...params, valueList: values });
                }
            })
            .catch(() => {
                this.setValueListInternal({ ...params, valueList: [], refresh: true });
            });
    }

    /**
     * This method updates the list of select options
     */
    private setValues(values: TValue[] | undefined): void {
        this.values = values;
        this.searchStrings = this.getSearchStringsFromValues(values || []);
    }

    public override showPicker() {
        const { listComponent, value } = this;

        if (!listComponent) {
            return;
        }

        super.showPicker();

        // if value is undefined, we default to null and check the list of values for null
        const valueToUse: TValue[] | TValue | null = value ?? null;

        listComponent.selectValue(valueToUse);
        const idx = listComponent.getIndicesForValues(valueToUse)[0];

        if (idx != null) {
            this.tooltipFeature?.attemptToHideTooltip();
            listComponent.highlightIndex(idx);
        } else {
            listComponent.refresh();
        }
    }

    private createOrUpdatePillContainer(container: HTMLElement): void {
        if (!this.pillContainer) {
            const pillContainer = (this.pillContainer = this.createBean(new AgPillContainer<TValue>()));
            this.addDestroyFunc(() => {
                this.destroyBean(this.pillContainer);
                this.pillContainer = null;
            });

            _clearElement(container);
            container.appendChild(pillContainer.getGui());

            const { config, eWrapper, ariaDeleteSelection } = this;

            pillContainer.init({
                eWrapper,
                valueFormatter: this.valueFormatter,
                onPillMouseDown: (e: MouseEvent) => {
                    e.stopImmediatePropagation();
                },
                announceItemFocus: () => {
                    this.announceAriaValue(ariaDeleteSelection);
                },
                focusAfterDelete: config.allowTyping ? () => this.focusTypingInputAtBoundary() : undefined,
                focusAfterForwardBoundary: config.allowTyping ? () => this.focusTypingInputAtBoundary() : undefined,
                onHorizontalArrowKeyDown: this.onPillHorizontalArrowKeyDown,
                getValue: () => this.getValue() as TValue[] | null,
                setValue: (value: TValue[] | null) => this.setValue(value, true),
            });
        }

        const previousPillCount = this.pillContainer.getGui().childElementCount;
        this.doWhileBlockingAnnouncement(() => this.pillContainer?.refresh());
        this.scrollTypingMultiSelectPillsToEndOnAdd(previousPillCount);
    }

    private scrollTypingMultiSelectPillsToEndOnAdd(previousPillCount: number): void {
        const { allowTyping, multiSelect, suppressMultiSelectPillRenderer } = this.config;

        if (!allowTyping || !multiSelect || suppressMultiSelectPillRenderer) {
            return;
        }

        const ePillContainer = this.pillContainer?.getGui();
        if (!ePillContainer || ePillContainer.childElementCount <= previousPillCount) {
            return;
        }

        _setScrollLeft(ePillContainer, ePillContainer.scrollWidth, this.isRtl());
    }

    private doWhileBlockingAnnouncement(func: () => void): void {
        this.skipWrapperAnnouncement = true;
        func();
        this.skipWrapperAnnouncement = false;
    }

    private readonly onPillHorizontalArrowKeyDown = (e: KeyboardEvent): void => {
        this.handleHorizontalNavigationKey(e);
    };

    private isPreviousHorizontalNavigation(key: string): boolean {
        return (key === KeyCode.LEFT) !== this.isRtl();
    }

    private isRtl(): boolean {
        return !!this.gos?.get('enableRtl');
    }

    private isTypingInputAtPillBoundary(): boolean {
        const inputEl = this.eInput.getInputElement();
        const { selectionStart, selectionEnd, value } = inputEl;

        if (selectionStart == null || selectionEnd == null || selectionStart !== selectionEnd) {
            return false;
        }

        const isRtl = this.isRtl();
        return isRtl ? selectionStart === (value ?? '').length : selectionStart === 0;
    }

    private focusTypingInputAtBoundary(): void {
        const inputEl = this.eInput.getInputElement();
        inputEl.focus();
        const caret = this.isRtl() ? inputEl.value.length : 0;
        inputEl.setSelectionRange(caret, caret);
    }

    private getActiveElementForKeyboardNavigation(): Element | null {
        if (this.beans?.eRootDiv) {
            return _getActiveDomElement(this.beans);
        }

        const inputEl = this.getTypingInputElement();

        if (!inputEl) {
            return document.activeElement;
        }

        return inputEl.ownerDocument?.activeElement ?? document.activeElement;
    }

    private onWrapperFocus(): void {
        const { eInput, config } = this;
        const { allowTyping, multiSelect, suppressDeselectAll } = config;

        if (allowTyping) {
            const focusableEl = eInput.getFocusableElement() as HTMLInputElement;
            focusableEl.focus();
            focusableEl.select();
        } else if (multiSelect && !suppressDeselectAll && !this.skipWrapperAnnouncement) {
            this.announceAriaValue(this.ariaDeselectAllItems);
        }
    }

    private onWrapperFocusOut(e: FocusEvent): void {
        if (!this.eWrapper.contains(e.relatedTarget as Element)) {
            this.hidePicker();
        }
    }

    private onDeselectAllMouseDown(e: MouseEvent): void {
        // don't expand or collapse picker when clicking on deselect all
        e.stopImmediatePropagation();
    }

    private onDeselectAllClick(): void {
        this.setValue([], true);
    }

    private buildSearchStringFromKeyboardEvent(searchKey: KeyboardEvent) {
        let { key } = searchKey;

        if (key === KeyCode.BACKSPACE) {
            this.searchString = this.searchString.slice(0, -1);
            key = '';
        } else if (!_isEventFromPrintableCharacter(searchKey)) {
            return;
        }

        searchKey.preventDefault();

        this.searchTextFromCharacter(key);
    }

    private searchTextFromCharacter(char: string): void {
        this.searchString += char;
        this.runSearch();
        this.clearSearchString();
    }

    public searchTextFromString(str: string | null | undefined): void {
        if (str == null) {
            str = '';
        }
        this.searchString = str;
        if (this.onSearchCallbackDebounced) {
            this.setValueList({ valueList: undefined, refresh: true });
        }
        this.runSearch();
    }

    private getSearchStringsFromValues(values: TValue[]): string[] | undefined {
        if (typeof values[0] === 'object' && this.searchStringCreator) {
            return this.searchStringCreator(values);
        }

        return values.map((value) => (value === '' ? '' : this.valueFormatter(value)));
    }

    private filterListModel(filteredValues: TValue[]): void {
        const { filterList } = this.config;

        if (!filterList) {
            return;
        }

        this.setValueList({ valueList: filteredValues, refresh: true });
    }

    private runSearch() {
        if (!this.listComponent) {
            return;
        }
        if (this.onSearchCallbackDebounced) {
            // this can potentially update the searchStrings synchronously and asynchronously
            this.onSearchCallbackDebounced(this.searchString);
            return;
        }
        const searchStrings = this.searchStrings;

        if (!searchStrings) {
            this.listComponent.highlightIndex(-1);
            return;
        }

        const { suggestions, filteredValues } = this.getSuggestionsAndFilteredValues(this.searchString, searchStrings);
        const { filterList, highlightMatch, searchType = 'fuzzy' } = this.config;
        const shouldFilter = !!(filterList && this.searchString !== '');

        this.filterListModel(shouldFilter ? filteredValues : this.values || []);

        if (!this.highlightEmptyValue()) {
            this.highlightListValue(suggestions, filteredValues, shouldFilter);
        }

        if (highlightMatch && searchType !== 'fuzzy') {
            this.listComponent?.highlightFilterMatch(this.searchString);
        }

        this.listComponent?.toggleVisibility();
    }

    private highlightEmptyValue(): boolean {
        if (this.searchString === '') {
            const emptyIdx = this.searchStrings?.indexOf('');
            if (emptyIdx !== undefined && emptyIdx !== -1) {
                this.listComponent?.highlightIndex(emptyIdx);
                return true;
            }
        }
        return false;
    }

    private highlightListValue(suggestions: string[], filteredValues: TValue[], shouldFilter: boolean): void {
        if (suggestions.length) {
            const topSuggestionIndex = shouldFilter ? 0 : this.searchStrings?.indexOf(suggestions[0]);
            if (topSuggestionIndex !== undefined) {
                this.listComponent?.highlightIndex(topSuggestionIndex);
            }
        } else {
            this.listComponent?.highlightIndex(-1);

            if (!shouldFilter || filteredValues.length) {
                this.listComponent?.ensureIndexVisible(0);
            } else if (shouldFilter) {
                // active-descendant is managed on the focusable element (wrapper/input),
                // so clear it there to avoid stale references after filtering to no results.
                const eAriaEl = this.getFocusableElement();
                _addOrRemoveAttribute(eAriaEl, 'data-active-option', null);
                _setAriaActiveDescendant(eAriaEl, null);
            }
        }
    }

    private getSuggestionsAndFilteredValues(
        searchValue: string,
        valueList: string[]
    ): { suggestions: string[]; filteredValues: TValue[] } {
        let suggestions: string[] = [];
        const filteredValues: TValue[] = [];

        if (!searchValue.length) {
            return { suggestions, filteredValues };
        }

        const { searchType = 'fuzzy', filterList } = this.config;
        const values = this.values || [];
        if (searchType === 'fuzzy') {
            const fuzzySearchResult = _fuzzySuggestions({
                inputValue: searchValue,
                allSuggestions: valueList,
                hideIrrelevant: true,
            });
            suggestions = fuzzySearchResult.values;

            const indices = fuzzySearchResult.indices;
            if (filterList && indices.length) {
                for (let i = 0; i < indices.length; i++) {
                    filteredValues.push(values[indices[i]]);
                }
            }
        } else {
            suggestions = valueList.filter((val, idx) => {
                const currentValue = val.toLocaleLowerCase();
                const valueToMatch = this.searchString.toLocaleLowerCase();

                const isMatch =
                    searchType === 'match'
                        ? currentValue.startsWith(valueToMatch)
                        : currentValue.includes(valueToMatch);
                if (filterList && isMatch) {
                    filteredValues.push(values[idx]);
                }
                return isMatch;
            });
        }

        return { suggestions, filteredValues };
    }

    private clearSearchString(): void {
        this.searchString = '';
    }

    public override setValue(
        value: TValue[] | TValue | null,
        silent?: boolean,
        fromPicker?: boolean,
        skipRendering?: boolean
    ): this {
        if (this.value === value) {
            this.updateTypingMultiSelectPlaceholder();
            return this;
        }

        const isArray = Array.isArray(value);

        if (value != null) {
            if (!isArray) {
                const indices = this.listComponent?.getIndicesForValues(value);
                if (!indices?.length) {
                    return this;
                }
            }

            if (!fromPicker) {
                this.listComponent?.selectValue(value);
            }
        }

        super.setValue(value, silent);

        if (!skipRendering) {
            this.renderSelectedValue(fromPicker);
        } else {
            this.updateTypingMultiSelectPlaceholder();
        }

        return this;
    }

    private onNavigationKeyDown(event: any, key: string, announceItem: () => void): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();

        const isDown = key === KeyCode.DOWN;

        if (!this.isPickerDisplayed && isDown) {
            this.showPicker();
            return;
        }

        this.listComponent?.onNavigationKeyDown(key, announceItem);
    }

    protected onEnterKeyDown(e: KeyboardEvent): void {
        const isTypingMultiSelect = !!(this.config.allowTyping && this.config.multiSelect);

        if (!this.isPickerDisplayed) {
            if (isTypingMultiSelect) {
                e.preventDefault();
                this.dispatchPickerEventAndHidePicker(this.value, true);
            }
            return;
        }

        e.preventDefault();

        if (this.listComponent?.getCurrentList()) {
            const lastRowHovered = this.listComponent.getLastItemHovered();

            if (isTypingMultiSelect) {
                if (lastRowHovered !== undefined) {
                    const values = this.getCurrentSelectionWithAppendedItem(lastRowHovered);
                    this.listComponent.selectValue(values);
                    this.setValue(values, false, true);
                    this.resetTypingMultiSelectSearchState();
                    this.hidePicker();
                }
                return;
            }

            if (this.config.multiSelect || lastRowHovered === undefined) {
                this.dispatchPickerEventAndHidePicker(this.value, true);
            } else {
                this.onListValueSelected(new Set<TValue>([lastRowHovered]), true);
            }
        }
    }

    private getCurrentSelectionWithAppendedItem(item: TValue): TValue[] {
        const value = this.getValue();
        const values = Array.isArray(value) ? [...value] : value != null ? [value] : [];

        if (!values.some((selectedValue) => this.areValuesEquivalent(selectedValue, item))) {
            values.push(item);
        }

        return values;
    }

    private areValuesEquivalent(left: TValue, right: TValue): boolean {
        if (left === right) {
            return true;
        }

        if (typeof left === 'object' && typeof right === 'object' && left != null && right != null) {
            return this.valueFormatter(left) === this.valueFormatter(right);
        }

        return false;
    }

    private resetTypingMultiSelectSearchState(): void {
        this.searchString = '';
        this.eInput.setValue('', true);

        if (this.onSearchCallbackDebounced) {
            this.setValueList({ valueList: undefined, refresh: true });
            return;
        }

        if (this.config.filterList && this.values) {
            this.setValueList({ valueList: this.values, refresh: true });
        }
    }

    private updateTypingMultiSelectPlaceholder(inputValue?: string | null): void {
        const { allowTyping, multiSelect, placeholder } = this.config;

        if (!allowTyping || !multiSelect) {
            return;
        }

        const currentInputValue = inputValue ?? this.eInput.getValue() ?? '';
        const hasInputValue = currentInputValue.length > 0;
        const value = this.value;
        const hasSelectedValues =
            (Array.isArray(value) ? value.length > 0 : value != null) ||
            (this.listComponent?.getSelectedItems().size ?? 0) > 0;
        const nextPlaceholder = !hasInputValue && !hasSelectedValues ? placeholder : '';

        this.eInput.setInputPlaceholder(nextPlaceholder);

        this.updateTypingMultiSelectInputSize(currentInputValue, nextPlaceholder);
    }

    private updateTypingMultiSelectInputSize(inputValue: string, placeholder?: string): void {
        const inputEl = this.getTypingInputElement();

        if (!inputEl) {
            return;
        }

        const widthSource = inputValue || placeholder || '';
        // keep the input compact beside pills but still large enough for the current text.
        const nextSize = _clamp(widthSource.length + 1, 1, 32);

        if (inputEl.size !== nextSize) {
            inputEl.size = nextSize;
        }

        if (inputValue) {
            const ePillContainer = this.pillContainer?.getGui();
            if (ePillContainer) {
                _setScrollLeft(ePillContainer, ePillContainer.scrollWidth, this.isRtl());
            }
        }
    }

    private getTypingInputElement(): HTMLInputElement | undefined {
        const getInputElement = (this.eInput as Partial<GridInputTextField>).getInputElement;
        if (typeof getInputElement !== 'function') {
            return;
        }

        return getInputElement.call(this.eInput);
    }

    private openPickerOnTypingIfNeeded(value: string | null | undefined): void {
        const {
            isPickerDisplayed,
            config: { allowTyping, multiSelect },
        } = this;

        if (allowTyping && multiSelect && !isPickerDisplayed && !!value) {
            this.showPicker();
        }
    }

    private onDeleteKeyDown(e: KeyboardEvent): void {
        const { eWrapper, beans } = this;
        const activeEl = _getActiveDomElement(beans);

        if (activeEl === eWrapper) {
            e.preventDefault();
            this.setValue([], true);
        }
    }

    private onBackspaceKeyDown(e: KeyboardEvent): void {
        if (!this.isTypingInputAtPillBoundary()) {
            return;
        }

        const value = this.getValue();
        const selectedValues = Array.isArray(value)
            ? value
            : value != null
              ? [value]
              : Array.from(this.listComponent?.getSelectedItems() ?? []);

        if (!selectedValues.length) {
            return;
        }

        e.preventDefault();
        this.setValue(selectedValues.slice(0, -1), true);
    }

    private onTabKeyDown(): void {
        const { config, isPickerDisplayed, listComponent } = this;
        const { multiSelect } = config;

        if (!isPickerDisplayed || !listComponent) {
            return;
        }

        if (multiSelect) {
            const values = this.getValueFromSet(listComponent.getSelectedItems());

            if (values) {
                this.setValue(values, false, true, true);
            }
        } else {
            const lastItemHovered = listComponent.getLastItemHovered();
            if (lastItemHovered !== undefined) {
                this.setValue(lastItemHovered, false, true);
            }
        }
        this.hidePicker();
    }

    private getValueFromSet(valueSet: Set<TValue>): TValue[] | TValue | null {
        const { multiSelect } = this.config;
        // keep the historical return shape for non-multi-select editors:
        // always return a scalar (or null), never an array.
        // this is also prevents a misconfiguration from leaving more than one item selected.
        if (!multiSelect) {
            return valueSet.size ? valueSet.values().next().value : null;
        }

        // preserve the exact order in which the user selected values.
        // Set iteration order is insertion order, so this keeps pill order stable:
        // selecting "Orange" then "Aqua" remains ["Orange", "Aqua"].
        const selectedValues = Array.from(valueSet);
        return selectedValues.length ? selectedValues : null;
    }

    private onListValueSelected(valueSet: Set<TValue>, fromEnterKey: boolean): void {
        const newValue = this.getValueFromSet(valueSet);

        this.setValue(newValue, false, true);

        const { multiSelect, allowTyping } = this.config;

        if (multiSelect && allowTyping) {
            this.resetTypingMultiSelectSearchState();
            this.hidePicker();
        } else if (!multiSelect) {
            this.dispatchPickerEventAndHidePicker(newValue, fromEnterKey);
        }
    }

    private dispatchPickerEventAndHidePicker(value: TValue[] | TValue | null, fromEnterKey: boolean): void {
        const event: WithoutGridCommon<FieldPickerValueSelectedEvent> = {
            type: 'fieldPickerValueSelected',
            fromEnterKey,
            value,
        };

        this.dispatchLocalEvent(event);
        this.hidePicker();
    }

    public override getFocusableElement(): HTMLElement {
        const { allowTyping } = this.config;

        if (allowTyping) {
            return this.eInput.getFocusableElement();
        }

        return super.getFocusableElement();
    }

    private handleHorizontalNavigationKey(e: KeyboardEvent): void {
        const { allowTyping, multiSelect } = this.config;

        if (!allowTyping) {
            e.preventDefault();
            this.listComponent?.highlightIndex(-1);
            this.pillContainer?.onNavigationKeyDown(e);
            return;
        }

        const pillContainer = this.pillContainer;
        if (!pillContainer) {
            return;
        }

        if (!multiSelect) {
            return;
        }

        const activeEl = this.getActiveElementForKeyboardNavigation();
        const isPrevious = this.isPreviousHorizontalNavigation(e.key);
        const inputEl = this.eInput.getInputElement();

        if (activeEl === inputEl) {
            if (isPrevious && this.isTypingInputAtPillBoundary()) {
                this.listComponent?.highlightIndex(-1);
                pillContainer.onNavigationKeyDown(e);
            }
            return;
        }

        if (pillContainer.getGui().contains(activeEl)) {
            this.listComponent?.highlightIndex(-1);
            const activeBefore = activeEl;
            pillContainer.onNavigationKeyDown(e);

            // Navigating forward from the last pill should move focus back into the input.
            if (!isPrevious && this.getActiveElementForKeyboardNavigation() === activeBefore) {
                this.focusTypingInputAtBoundary();
            }
        }
    }

    private handlePageNavigationKey(e: KeyboardEvent, key: string): void {
        const { allowTyping } = this.config;

        if (allowTyping && (key === KeyCode.PAGE_HOME || key === KeyCode.PAGE_END)) {
            e.preventDefault();
            const inputEl = this.eInput.getInputElement();
            const target = key === KeyCode.PAGE_HOME ? 0 : inputEl.value.length;
            inputEl.setSelectionRange(target, target);
            return;
        }

        e.preventDefault();
        if (this.pickerComponent) {
            this.listComponent?.navigateToPage(key as 'PageUp' | 'PageDown' | 'Home' | 'End');
        }
    }

    private handleVerticalNavigationKey(e: KeyboardEvent, key: string, isComposing: boolean): void {
        if (isComposing) {
            return;
        }

        this.onNavigationKeyDown(e, key, () => {
            if (this.config.multiSelect) {
                this.doWhileBlockingAnnouncement(() => this.eWrapper.focus());
                this.announceAriaValue(this.ariaToggleSelection);
            }
        });
    }

    private handleEscapeKey(e: KeyboardEvent): void {
        if (!this.isPickerDisplayed) {
            return;
        }

        if (_isVisible(this.listComponent!.getGui())) {
            e.preventDefault();
            _stopPropagationForAgGrid(e);
        }
        this.hidePicker();
    }

    private handleEnterKey(e: KeyboardEvent, isComposing: boolean): void {
        if (isComposing) {
            e.preventDefault();
            return;
        }

        this.onEnterKeyDown(e);
    }

    private handleSpaceKey(e: KeyboardEvent, isComposing: boolean): void {
        const { allowTyping, multiSelect } = this.config;
        const { isPickerDisplayed, listComponent } = this;
        const shouldToggleSelectionWithSpace =
            !isComposing &&
            isPickerDisplayed &&
            multiSelect &&
            !!listComponent &&
            (!allowTyping || (this.eInput.getValue() ?? '') === '');

        if (!allowTyping || isComposing || shouldToggleSelectionWithSpace) {
            e.preventDefault();
        }

        if (shouldToggleSelectionWithSpace && listComponent) {
            const lastItemHovered = listComponent.getLastItemHovered();
            if (lastItemHovered !== undefined) {
                listComponent.toggleListItemSelection(lastItemHovered);
            }
        }
    }

    private handleBackspaceKey(e: KeyboardEvent, isComposing: boolean): void {
        if (!isComposing && this.config.allowTyping && this.config.multiSelect) {
            this.onBackspaceKeyDown(e);
        }
    }

    private handleDeleteKey(e: KeyboardEvent): void {
        if (this.config.multiSelect && !this.config.suppressDeselectAll) {
            this.onDeleteKeyDown(e);
        }
    }

    private handleSearchWithoutTyping(e: KeyboardEvent): void {
        if (!this.config.allowTyping) {
            // this allows searching even without the input field, this is for historical reasons
            this.buildSearchStringFromKeyboardEvent(e);
        }
    }

    protected override onKeyDown(e: KeyboardEvent): void {
        const { key, isComposing } = e;

        switch (key) {
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                this.handleHorizontalNavigationKey(e);
                break;
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_DOWN:
                this.handlePageNavigationKey(e, key);
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.handleVerticalNavigationKey(e, key, isComposing);
                break;
            case KeyCode.ESCAPE:
                this.handleEscapeKey(e);
                break;
            case KeyCode.ENTER:
                this.handleEnterKey(e, isComposing);
                break;
            case KeyCode.SPACE:
                this.handleSpaceKey(e, isComposing);
                break;
            case KeyCode.BACKSPACE:
                this.handleBackspaceKey(e, isComposing);
                break;
            case KeyCode.TAB:
                this.onTabKeyDown();
                break;
            case KeyCode.DELETE:
                this.handleDeleteKey(e);
                break;
            default:
                this.handleSearchWithoutTyping(e);
        }
    }

    private announceAriaValue(value: string): void {
        this.ariaAnnounce?.announceValue(value, 'richSelect');
    }

    public override destroy(): void {
        this.asyncRequests?.destroy();
        this.asyncRequests = undefined;
        this.hasPagedAsyncSource = false;

        if (this.listComponent) {
            this.listComponent = this.destroyBean(this.listComponent);
        }

        this.searchStrings = undefined;

        super.destroy();
    }
}

/**
 * cell renderers are used in a few places. they bind to dom slightly differently to other cell renders as they
 * can return back strings (instead of html element) in the getGui() method. common code placed here to handle that.
 * @param {AgPromise<ICellRendererComp>} cellRendererPromise
 * @param {HTMLElement} eTarget
 */
export function _bindCellRendererToHtmlElement(
    cellRendererPromise: AgPromise<ICellRendererComp>,
    eTarget: HTMLElement
) {
    cellRendererPromise.then((cellRenderer) => {
        const gui = cellRenderer!.getGui();

        if (gui != null) {
            eTarget.appendChild(gui);
        }
    });
}

type RichSelectValueFormatter<TValue> = (value: TValue | TValue[] | null | undefined) => string;

export function resolveRichSelectValueFormatter<TValue>(
    valueFormatter?: RichSelectParams<TValue>['valueFormatter']
): RichSelectValueFormatter<TValue> {
    return (value) => valueFormatter?.(value) ?? String(value ?? '');
}
