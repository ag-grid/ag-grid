import type {
    AgPromise,
    BeanCollection,
    FieldPickerValueSelectedEvent,
    ICellRendererParams,
    RichSelectParams,
    UserCompDetails,
    UserComponentFactory,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import {
    AgInputTextField,
    AgPickerField,
    KeyCode,
    RefPlaceholder,
    _bindCellRendererToHtmlElement,
    _clearElement,
    _debounce,
    _escapeString,
    _exists,
    _fuzzySuggestions,
    _isEventFromPrintableCharacter,
    _isVisible,
    _setAriaActiveDescendant,
    _stopPropagationForAgGrid,
} from '@ag-grid-community/core';

import { AgRichSelectList } from './agRichSelectList';

const TEMPLATE = /* html */ `
    <div class="ag-picker-field" role="presentation">
        <div data-ref="eLabel"></div>
            <div data-ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper ag-rich-select-value ag-picker-collapsed">
            <div data-ref="eDisplayField" class="ag-picker-field-display"></div>
            <ag-input-text-field data-ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
            <div data-ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
        </div>
    </div>`;

export class AgRichSelect<TValue = any> extends AgPickerField<
    TValue[] | TValue,
    RichSelectParams<TValue>,
    string,
    AgRichSelectList<TValue>
> {
    private userComponentFactory: UserComponentFactory;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.userComponentFactory = beans.userComponentFactory;
    }

    private searchString = '';
    private listComponent: AgRichSelectList<TValue> | undefined;
    protected values: TValue[];

    private searchStringCreator: ((values: TValue[]) => string[]) | null = null;
    private readonly eInput: AgInputTextField = RefPlaceholder;

    constructor(config?: RichSelectParams<TValue>) {
        super({
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'ag-list',
            className: 'ag-rich-select',
            pickerIcon: 'smallDown',
            ariaRole: 'combobox',
            template: config?.template ?? TEMPLATE,
            agComponents: [AgInputTextField],
            modalPicker: false,
            ...config,
            // maxPickerHeight needs to be set after expanding `config`
            maxPickerHeight: config?.maxPickerHeight ?? 'calc(var(--ag-row-height) * 6.5)',
        });

        const { value, valueList, searchStringCreator } = config || {};

        if (value !== undefined) {
            this.value = value;
        }

        if (valueList != null) {
            this.values = valueList;
        }

        if (searchStringCreator) {
            this.searchStringCreator = searchStringCreator;
        }
    }

    public override postConstruct(): void {
        super.postConstruct();
        this.createListComponent();

        const { allowTyping, placeholder } = this.config;

        if (allowTyping) {
            this.eInput.setAutoComplete(false).setInputPlaceholder(placeholder);
            this.eDisplayField.classList.add('ag-hidden');
        } else {
            this.eInput.setDisplayed(false);
        }

        this.eWrapper.tabIndex = this.gos.get('tabIndex');

        const { searchDebounceDelay = 300 } = this.config;
        this.clearSearchString = _debounce(this.clearSearchString, searchDebounceDelay);

        this.renderSelectedValue();

        if (allowTyping) {
            this.eInput.onValueChange((value) => this.searchTextFromString(value));
            this.addManagedElementListeners(this.eWrapper, { focus: this.onWrapperFocus.bind(this) });
        }
        this.addManagedElementListeners(this.eWrapper, { focusout: this.onWrapperFocusOut.bind(this) });
    }

    private createListComponent(): void {
        this.listComponent = this.createBean(new AgRichSelectList(this.config, this.eWrapper, () => this.searchString));

        this.listComponent.setParentComponent(this);

        this.addManagedListeners(this.listComponent, {
            fieldPickerValueSelected: (e: FieldPickerValueSelectedEvent) => {
                this.onListValueSelected(e.value, e.fromEnterKey);
            },
        });
    }

    private renderSelectedValue(): void {
        const { value, eDisplayField, config } = this;
        const { allowTyping, initialInputValue } = this.config;
        const valueFormatted = this.config.valueFormatter ? this.config.valueFormatter(value) : value;

        if (allowTyping) {
            this.eInput.setValue(initialInputValue ?? valueFormatted);
            return;
        }

        let userCompDetails: UserCompDetails | undefined;

        if (config.cellRenderer) {
            userCompDetails = this.userComponentFactory.getCellRendererDetails(this.config, {
                value,
                valueFormatted,
            } as ICellRendererParams);
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
            if (_exists(this.value)) {
                eDisplayField.innerText = valueFormatted;
                eDisplayField.classList.remove('ag-display-as-placeholder');
            } else {
                const { placeholder } = config;
                if (_exists(placeholder)) {
                    eDisplayField.innerHTML = `${_escapeString(placeholder)}`;
                    eDisplayField.classList.add('ag-display-as-placeholder');
                } else {
                    _clearElement(eDisplayField);
                }
            }

            this.setTooltip({
                newTooltipText: valueFormatted ?? null,
                shouldDisplayTooltip: () => this.eDisplayField.scrollWidth > this.eDisplayField.clientWidth,
            });
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

    public setValueList(params: { valueList: TValue[]; refresh?: boolean }): void {
        const { valueList, refresh } = params;

        if (!this.listComponent || this.listComponent.getCurrentList() === valueList) {
            return;
        }

        this.listComponent.setCurrentList(valueList);

        if (refresh) {
            // if `values` is not present, it means the valuesList was set asynchronously
            if (!this.values) {
                this.values = valueList;
                if (this.isPickerDisplayed) {
                    this.listComponent.selectValue(this.value);
                }
            } else {
                this.listComponent.refresh(true);
            }
        }
    }

    public override showPicker() {
        super.showPicker();
        const { listComponent, value } = this;

        if (!listComponent) {
            return;
        }

        let idx = null;
        if (this.value != null) {
            listComponent.selectValue(this.value);
            idx = listComponent.getIndicesForValues(Array.isArray(value) ? value : [value])[0];
        }

        if (idx != null) {
            listComponent.highlightIndex(idx);
        } else {
            listComponent.refresh();
        }

        this.displayOrHidePicker();
    }

    protected override beforeHidePicker(): void {
        super.beforeHidePicker();
    }

    private onWrapperFocus(): void {
        if (!this.eInput) {
            return;
        }

        const focusableEl = this.eInput.getFocusableElement() as HTMLInputElement;
        focusableEl.focus();
        focusableEl.select();
    }

    private onWrapperFocusOut(e: FocusEvent): void {
        if (!this.eWrapper.contains(e.relatedTarget as Element)) {
            this.hidePicker();
        }
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
        this.runSearch();
    }

    private buildSearchStrings(values: TValue[]): string[] | undefined {
        const { valueFormatter = (value) => value } = this.config;

        let searchStrings: string[] | undefined;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map((v) => valueFormatter(v));
        } else if (typeof values[0] === 'object' && this.searchStringCreator) {
            searchStrings = this.searchStringCreator(values);
        }

        return searchStrings;
    }

    private filterListModel(filteredValues: TValue[]): void {
        const { filterList } = this.config;

        if (!filterList) {
            return;
        }

        this.setValueList({ valueList: filteredValues, refresh: true });
        this.alignPickerToComponent();
    }

    private runSearch() {
        if (!this.listComponent) {
            return;
        }

        const { values } = this;
        const searchStrings = this.buildSearchStrings(values);

        if (!searchStrings) {
            this.listComponent.highlightIndex(-1);
            return;
        }

        const { suggestions, filteredValues } = this.getSuggestionsAndFilteredValues(this.searchString, searchStrings);
        const { filterList, highlightMatch, searchType = 'fuzzy' } = this.config;

        const filterValueLen = filteredValues.length;
        const shouldFilter = !!(filterList && this.searchString !== '');

        this.filterListModel(shouldFilter ? filteredValues : values);

        if (suggestions.length) {
            const topSuggestionIndex = shouldFilter ? 0 : searchStrings.indexOf(suggestions[0]);
            this.listComponent?.highlightIndex(topSuggestionIndex);
        } else {
            this.listComponent?.highlightIndex(-1);

            if (!shouldFilter || filterValueLen) {
                this.listComponent?.ensureIndexVisible(0);
            } else if (shouldFilter) {
                this.getAriaElement().removeAttribute('data-active-option');
                const eListAriaEl = this.listComponent?.getAriaElement();
                if (eListAriaEl) {
                    _setAriaActiveDescendant(eListAriaEl, null);
                }
            }
        }

        if (highlightMatch && searchType !== 'fuzzy') {
            this.listComponent?.highlightFilterMatch(this.searchString);
        }

        this.displayOrHidePicker();
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

        if (searchType === 'fuzzy') {
            const fuzzySearchResult = _fuzzySuggestions(searchValue, valueList, true);
            suggestions = fuzzySearchResult.values;

            const indices = fuzzySearchResult.indices;
            if (filterList && indices.length) {
                for (let i = 0; i < indices.length; i++) {
                    filteredValues.push(this.values[indices[i]]);
                }
            }
        } else {
            suggestions = valueList.filter((val, idx) => {
                const currentValue = val.toLocaleLowerCase();
                const valueToMatch = this.searchString.toLocaleLowerCase();

                const isMatch =
                    searchType === 'match'
                        ? currentValue.startsWith(valueToMatch)
                        : currentValue.indexOf(valueToMatch) !== -1;
                if (filterList && isMatch) {
                    filteredValues.push(this.values[idx]);
                }
                return isMatch;
            });
        }

        return { suggestions, filteredValues };
    }

    private displayOrHidePicker(): void {
        if (!this.listComponent) {
            return;
        }

        const eListGui = this.listComponent.getGui();
        const list = this.listComponent.getCurrentList();
        const toggleValue = list ? list.length === 0 : false;

        eListGui.classList.toggle('ag-hidden', toggleValue);
    }

    private clearSearchString(): void {
        this.searchString = '';
    }

    public override setValue(value: TValue[] | TValue, silent?: boolean, fromPicker?: boolean): this {
        if (this.value === value) {
            return this;
        }

        if (Array.isArray(value)) {
            if (!fromPicker) {
                this.listComponent?.selectValue(value);
            }
        } else {
            const list = this.listComponent?.getCurrentList();
            const index = list ? list.indexOf(value) : -1;

            if (index === -1) {
                return this;
            }

            if (!fromPicker) {
                this.listComponent?.selectListItems([value]);
            }
        }

        super.setValue(value, silent);

        this.renderSelectedValue();

        return this;
    }

    private onNavigationKeyDown(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();

        const isDown = key === KeyCode.DOWN;

        if (!this.isPickerDisplayed && isDown) {
            this.showPicker();
            return;
        }

        this.listComponent?.onNavigationKeyDown(key);
    }

    protected onEnterKeyDown(e: KeyboardEvent): void {
        if (!this.isPickerDisplayed) {
            return;
        }
        e.preventDefault();

        if (this.listComponent?.getCurrentList()) {
            if (this.config.multiSelect) {
                this.onListValueSelected(this.listComponent.getSelectedItems(), true);
            } else {
                const lastRowHovered = this.listComponent.getLastItemHovered();
                this.onListValueSelected(new Set<TValue>([lastRowHovered]), true);
            }
        }
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
                this.setValue(values, false, true);
            }
        } else {
            this.setValue(listComponent.getLastItemHovered(), false, true);
        }
    }

    private getValueFromSet(valueSet: Set<TValue>): TValue[] | TValue | undefined {
        const { multiSelect } = this.config;
        let newValue: TValue[] | TValue | undefined;

        for (const value of valueSet) {
            if (valueSet.size === 1 && !multiSelect) {
                newValue = value;
                break;
            }
            if (!newValue) {
                newValue = [];
            }
            (newValue as TValue[]).push(value);
        }

        if (Array.isArray(newValue)) {
            newValue.sort();
        }

        return newValue;
    }

    private onListValueSelected(valueSet: Set<TValue>, fromEnterKey: boolean): void {
        const newValue = this.getValueFromSet(valueSet);

        if (newValue === undefined) {
            return;
        }

        this.setValue(newValue, false, true);
        this.dispatchPickerEvent(newValue, fromEnterKey);
        this.hidePicker();
    }

    private dispatchPickerEvent(value: TValue[] | TValue, fromEnterKey: boolean): void {
        const event: WithoutGridCommon<FieldPickerValueSelectedEvent> = {
            type: 'fieldPickerValueSelected',
            fromEnterKey,
            value,
        };

        this.dispatchLocalEvent(event);
    }

    public override getFocusableElement(): HTMLElement {
        const { allowTyping } = this.config;

        if (allowTyping) {
            return this.eInput.getFocusableElement();
        }

        return super.getFocusableElement();
    }

    protected override onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        const { isPickerDisplayed, config, listComponent, pickerComponent } = this;
        const { allowTyping, multiSelect } = config;

        switch (key) {
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                if (!allowTyping) {
                    event.preventDefault();
                }
                break;
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                if (allowTyping) {
                    event.preventDefault();
                    const inputEl = this.eInput.getInputElement();
                    const target = key === KeyCode.PAGE_HOME ? 0 : inputEl.value.length;
                    inputEl.setSelectionRange(target, target);
                    break;
                }
            // Only break here for allowTyping, otherwise use the same logic as PageUp/PageDown
            // eslint-disable-next-line
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_DOWN:
                event.preventDefault();
                if (pickerComponent) {
                    listComponent?.navigateToPage(key);
                }
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
            case KeyCode.ESCAPE:
                if (isPickerDisplayed) {
                    if (_isVisible(this.listComponent!.getGui())) {
                        event.preventDefault();
                        _stopPropagationForAgGrid(event);
                    }
                    this.hidePicker();
                }
                break;
            case KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case KeyCode.SPACE:
                if (isPickerDisplayed && multiSelect && listComponent) {
                    event.preventDefault();
                    const lastItemHovered = listComponent.getLastItemHovered();

                    if (lastItemHovered) {
                        listComponent.toggleListItemSelection(lastItemHovered);
                    }
                }
                break;
            case KeyCode.TAB:
                this.onTabKeyDown();
                break;
            default:
                if (!allowTyping) {
                    this.buildSearchStringFromKeyboardEvent(event);
                }
        }
    }

    public override destroy(): void {
        if (this.listComponent) {
            this.listComponent = this.destroyBean(this.listComponent);
        }

        super.destroy();
    }
}
