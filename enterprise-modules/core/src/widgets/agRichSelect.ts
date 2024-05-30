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
    Events,
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

    private cellRowHeight: number;
    private highlightedItem: number = -1;
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

        const { cellRowHeight, value, valueList, searchStringCreator } = config || {};

        if (cellRowHeight != null) {
            this.cellRowHeight = cellRowHeight;
        }

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
            this.addManagedListener(this.eWrapper, 'focus', this.onWrapperFocus.bind(this));
        }
        this.addManagedListener(this.eWrapper, 'focusout', this.onWrapperFocusOut.bind(this));
    }

    private createListComponent(): void {
        this.listComponent = this.createBean(new AgRichSelectList(this.config, this.eWrapper));
        this.listComponent.setParentComponent(this);

        this.addManagedListener(
            this.listComponent,
            Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            (e: FieldPickerValueSelectedEvent) => {
                this.onListValueSelected(e.value, e.fromEnterKey);
            }
        );
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
                    this.listComponent.highlightValue();
                }
            } else {
                this.listComponent.refresh(true);
            }
        }
    }

    public override showPicker() {
        super.showPicker();
        this.listComponent?.highlightValue();
        this.displayOrHidePicker();
    }

    protected override beforeHidePicker(): void {
        this.highlightedItem = -1;
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
            // this.hidePicker();
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
            const fuzzySearchResult = _fuzzySuggestions(this.searchString, valueList, true);
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

    private filterListModel(filteredValues: TValue[]): void {
        const { filterList } = this.config;

        if (!filterList) {
            return;
        }

        this.setValueList({ valueList: filteredValues, refresh: true });
        this.alignPickerToComponent();
    }

    private runSearch() {
        const { values } = this;
        const searchStrings = this.buildSearchStrings(values);

        if (!searchStrings) {
            this.listComponent?.highlightIndex(-1);
            return;
        }

        const { suggestions, filteredValues } = this.getSuggestionsAndFilteredValues(this.searchString, searchStrings);
        const { filterList, highlightMatch, searchType = 'fuzzy' } = this.config;

        const filterValueLen = filteredValues.length;
        const shouldFilter = !!(filterList && this.searchString !== '');

        this.filterListModel(shouldFilter ? filteredValues : values);

        if (suggestions.length) {
            const topSuggestionIndex = shouldFilter ? 0 : searchStrings.indexOf(suggestions[0]);
            this.listComponent?.selectListItem(topSuggestionIndex);
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

    public override setValue(value: TValue, silent?: boolean, fromPicker?: boolean): this {
        const list = this.listComponent?.getCurrentList();
        const index = list ? list.indexOf(value) : -1;

        if (index === -1) {
            return this;
        }

        this.value = value;

        if (!fromPicker) {
            this.listComponent?.selectListItem(index);
        }

        this.renderSelectedValue();

        return super.setValue(value, silent);
    }

    private onNavigationKeyDown(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();

        const isDown = key === KeyCode.DOWN;

        if (!this.isPickerDisplayed && isDown) {
            this.showPicker();
            return;
        }

        const oldIndex = this.highlightedItem;

        const diff = isDown ? 1 : -1;
        const newIndex = oldIndex === -1 ? 0 : oldIndex + diff;

        this.listComponent?.selectListItem(newIndex);
    }

    protected onEnterKeyDown(e: KeyboardEvent): void {
        if (!this.isPickerDisplayed) {
            return;
        }
        e.preventDefault();

        if (this.listComponent?.getCurrentList()) {
            //this.onListValueSelected(this.currentList[this.highlightedItem], true);
        }
    }

    private onListValueSelected(value: TValue, fromEnterKey: boolean): void {
        this.setValue(value, false, true);
        this.dispatchPickerEvent(value, fromEnterKey);
        this.hidePicker();
    }

    private dispatchPickerEvent(value: TValue, fromEnterKey: boolean): void {
        const event: WithoutGridCommon<FieldPickerValueSelectedEvent> = {
            type: Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey,
            value,
        };

        this.dispatchEvent(event);
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

        const { allowTyping } = this.config;

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
                if (this.pickerComponent) {
                    this.listComponent?.navigateToPage(key);
                }
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
            case KeyCode.ESCAPE:
                if (this.isPickerDisplayed) {
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
