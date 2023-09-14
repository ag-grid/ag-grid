import { UserCompDetails, UserComponentFactory } from "../components/framework/userComponentFactory";
import { KeyCode } from "../constants/keyCode";
import { Autowired } from "../context/context";
import { Events } from "../eventKeys";
import { FieldPickerValueSelectedEvent } from "../events";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { AgPromise } from "../utils";
import { setAriaActiveDescendant, setAriaControls, setAriaLabel } from "../utils/aria";
import { bindCellRendererToHtmlElement, clearElement } from "../utils/dom";
import { debounce } from "../utils/function";
import { fuzzySuggestions } from "../utils/fuzzyMatch";
import { exists } from "../utils/generic";
import { isEventFromPrintableCharacter } from "../utils/keyboard";
import { escapeString } from "../utils/string";
import { AgInputTextField } from "./agInputTextField";
import { AgPickerField, IPickerFieldParams } from "./agPickerField";
import { RichSelectRow } from "./agRichSelectRow";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { VirtualList } from "./virtualList";

export interface RichSelectParams<TValue = any> extends IPickerFieldParams {
    value?: TValue;
    valueList?: TValue[]
    allowTyping?: boolean;
    cellRenderer?: any;
    cellRowHeight?: number;
    searchDebounceDelay?: number;

    filterList?: boolean;
    searchType?: 'match' | 'matchAny' | 'fuzzy';
    highlightMatch?: boolean;
    placeholder?: string;

    valueFormatter?: (value: TValue) => any;
    searchStringCreator?: (values: TValue[]) => string[]
}

const TEMPLATE = /* html */`
    <div class="ag-picker-field" role="presentation">
        <div ref="eLabel"></div>
            <div ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper ag-picker-collapsed">
            <div ref="eDisplayField" class="ag-picker-field-display"></div>
            <ag-input-text-field ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
            <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
        </div>
    </div>`;

export class AgRichSelect<TValue = any> extends AgPickerField<TValue, RichSelectParams<TValue>, VirtualList> {

    private searchString = '';
    private listComponent: VirtualList | undefined;
    private values: TValue[];
    private currentList: TValue[];
    private cellRowHeight: number;
    private highlightedItem: number = -1;
    private lastRowHovered: number = -1;
    private searchStringCreator: ((values: TValue[]) => string[]) | null = null;
    private eLoading: HTMLElement | undefined;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @RefSelector('eInput') private eInput: AgInputTextField;
    

    constructor(config?: RichSelectParams<TValue>) {
        super({
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'ag-list',
            className: 'ag-rich-select',
            pickerIcon: 'smallDown',
            ariaRole: 'combobox',
            template: TEMPLATE,
            modalPicker: false,
            ...config,
            // maxPickerHeight needs to be set after expanding `config`
            maxPickerHeight: config?.maxPickerHeight ?? 'calc(var(--ag-row-height) * 6.5)',
        });

        const { cellRowHeight, value, valueList, searchStringCreator } = config || {};

        if (cellRowHeight != null) {
            this.cellRowHeight = cellRowHeight;
        }

        if (value != null) {
            this.value = value;
        }

        if (valueList != null) {
            this.values = valueList;
        }

        if (searchStringCreator) {
            this.searchStringCreator = searchStringCreator;
        }
    }

    protected postConstruct(): void {
        super.postConstruct();
        this.createLoadingElement();
        this.createListComponent();

        const { allowTyping, placeholder } = this.config;

        if (allowTyping) {
            this.eInput
                .setAutoComplete(false)
                .setInputPlaceholder(placeholder);

            this.eDisplayField.classList.add('ag-hidden');
        } else {
            this.eInput.setDisplayed(false);
        }

        this.eWrapper.tabIndex = this.gridOptionsService.getNum('tabIndex') ?? 0;
        this.eWrapper.classList.add('ag-rich-select-value');

        const { searchDebounceDelay = 300 } = this.config;
        this.clearSearchString = debounce(this.clearSearchString, searchDebounceDelay);

        this.renderSelectedValue();

        if (allowTyping) {
            this.eInput.onValueChange(value => this.searchTextFromString(value));
            this.addManagedListener(this.eWrapper, 'focus', this.onWrapperFocus.bind(this));
        }
        this.addManagedListener(this.eWrapper, 'focusout', this.onWrapperFocusOut.bind(this));

    }

    private createLoadingElement(): void {
        const eDocument = this.gridOptionsService.getDocument();
        const translate = this.localeService.getLocaleTextFunc();
        const el = eDocument.createElement('div');

        el.classList.add('ag-loading-text');
        el.innerText = translate('loadingOoo', 'Loading...');
        this.eLoading = el;
    }

    private createListComponent(): void {
        this.listComponent = this.createBean(new VirtualList({ cssIdentifier: 'rich-select' }))
        this.listComponent.setComponentCreator(this.createRowComponent.bind(this));
        this.listComponent.setParentComponent(this);

        this.addManagedListener(this.listComponent, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, (e: FieldPickerValueSelectedEvent) => {
            this.onListValueSelected(e.value, e.fromEnterKey);
        });
        
        const { cellRowHeight } = this;
        if (cellRowHeight) {
            this.listComponent.setRowHeight(cellRowHeight);
        }

        const eListGui = this.listComponent.getGui();
        const eListAriaEl = this.listComponent.getAriaElement();

        this.addManagedListener(eListGui, 'mousemove', this.onPickerMouseMove.bind(this));
        this.addManagedListener(eListGui, 'mousedown', e => e.preventDefault());
        eListGui.classList.add('ag-rich-select-list');

        const listId = `ag-rich-select-list-${this.listComponent.getCompId()}`;
        eListAriaEl.setAttribute('id', listId);
        const translate = this.localeService.getLocaleTextFunc();
        const ariaLabel = translate(this.config.pickerAriaLabelKey, this.config.pickerAriaLabelValue);

        setAriaLabel(eListAriaEl, ariaLabel);
        setAriaControls(this.eWrapper, eListAriaEl);
    }

    private renderSelectedValue(): void {
        const { value, eDisplayField, config } = this;
        const valueFormatted = this.config.valueFormatter ? this.config.valueFormatter(value) : value;

        if (config.allowTyping) {
            this.eInput.setValue(valueFormatted);
            return;
        }

        let userCompDetails: UserCompDetails | undefined;

        if (config.cellRenderer) {
            userCompDetails = this.userComponentFactory.getCellRendererDetails(this.config, {
                value,
                valueFormatted,
                api: this.gridOptionsService.api
            } as ICellRendererParams);
        }

        let userCompDetailsPromise: AgPromise<any> | undefined;

        if (userCompDetails) {
            userCompDetailsPromise = userCompDetails.newAgStackInstance();
        }

        if (userCompDetailsPromise) {
            clearElement(eDisplayField);
            bindCellRendererToHtmlElement(userCompDetailsPromise, eDisplayField);
            userCompDetailsPromise.then(renderer => {
                this.addDestroyFunc(() => this.getContext().destroyBean(renderer));
            });
        } else {
            if (exists(this.value)) {
                eDisplayField.innerText = valueFormatted;
                eDisplayField.classList.remove('ag-display-as-placeholder');
            } else {
                const { placeholder } = config;
                if (exists(placeholder)) {
                    eDisplayField.innerHTML = `${escapeString(placeholder)}`
                    eDisplayField.classList.add('ag-display-as-placeholder');
                } else {
                    clearElement(eDisplayField);
                }
            }
        }
    }

    private getCurrentValueIndex(): number {
        const { currentList, value } = this;

        if (value == null) { return -1; }

        for (let i = 0; i < currentList.length; i++) {
            if (currentList[i] === value) {
                return i;
            }
        }

        return -1;
    }

    private highlightFilterMatch(): void {
        this.listComponent?.forEachRenderedRow((cmp: RichSelectRow<TValue>, idx: number) => {
            cmp.highlightString(this.searchString);
        });
    }

    private highlightSelectedValue(index?: number): void {
        if (index == null) {
            index = this.getCurrentValueIndex();
        }

        this.highlightedItem = index;

        this.listComponent?.forEachRenderedRow((cmp: RichSelectRow<TValue>, idx: number) => {
            const highlighted = index === -1 ? false : this.highlightedItem === idx;
            cmp.updateHighlighted(highlighted);
        });
    }

    public setRowHeight(height: number): void {
        if (height !== this.cellRowHeight) {
            this.cellRowHeight = height;
        }

        if (this.listComponent) {
            this.listComponent.setRowHeight(height);
        }
    }

    protected createPickerComponent() {
        const { values }  = this;

        if (values) {
            this.setValueList({ valueList: values });
        }

        // do not create the picker every time to save state
        return this.listComponent!;
    }

    public setSearchStringCreator(searchStringFn: (values: TValue[]) => string[]): void {
        this.searchStringCreator = searchStringFn;
    }

    public setValueList(params: { valueList: TValue[], refresh?: boolean }): void {
        const { valueList, refresh } = params;

        if (!this.listComponent) { return; }
        if (this.currentList === valueList) { return; }

        this.currentList = valueList;

        this.listComponent.setModel({
            getRowCount: () => valueList.length,
            getRow: (index: number) => valueList[index]
        });

        if (refresh) {
            // if `values` is not present, it means the valuesList was set asynchronously
            if (!this.values) {
                this.values = valueList;
                if (this.isPickerDisplayed) {
                    this.showCurrentValueInPicker();
                }
            } else {
                this.listComponent.refresh();
            }
        }
    }

    public showPicker() {
        super.showPicker();
        this.showCurrentValueInPicker();
    }

    private showCurrentValueInPicker(): void {
        if (!this.listComponent) { return; }

        if (!this.currentList) { 
            if (this.isPickerDisplayed && this.eLoading) {
                this.listComponent.appendChild(this.eLoading);
            }
            return;
        }

        if (this.eLoading?.offsetParent) {
            this.eLoading.parentElement?.removeChild(this.eLoading);
        }

        const currentValueIndex = this.getCurrentValueIndex();

        if (currentValueIndex !== -1) {
            // make sure the virtual list has been sized correctly
            this.listComponent.refresh();
            this.listComponent.ensureIndexVisible(currentValueIndex);
            // this second call to refresh is necessary to force scrolled elements
            // to be rendered with the correct index info.
            this.listComponent.refresh(true);
            this.highlightSelectedValue(currentValueIndex);
        } else {
            this.listComponent.refresh();
        }
    }

    protected beforeHidePicker(): void {
        this.highlightedItem = -1;
        super.beforeHidePicker();
    }

    private onWrapperFocus(e: FocusEvent): void {
        if (this.eInput) {
            this.eInput.getFocusableElement().focus();
        }
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
        } else if (!isEventFromPrintableCharacter(searchKey)) {
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
        if (str == null) { str = ''; }
        this.searchString = str;
        this.runSearch();
    }

    private buildSearchStrings(values: TValue[]): string[] | undefined {
        const { valueFormatter = (value => value) } = this.config;

        let searchStrings: string[] | undefined;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(v => valueFormatter(v));
        } else if (typeof values[0] === 'object' && this.searchStringCreator) {
            searchStrings = this.searchStringCreator(values);
        }

        return searchStrings;
    }

    private getSuggestionsAndFilteredValues(searchValue: string, valueList: string[]): { suggestions: string[], filteredValues: TValue[] } {
        let suggestions: string[] = [];
        let filteredValues: TValue[] = [];

        if (!searchValue.length) { return { suggestions, filteredValues } };

        const { allowTyping, searchType = 'fuzzy', filterList } = this.config;

        const shouldFilterList = filterList && allowTyping;

        if (searchType === 'fuzzy') {
            const fuzzySearchResult = fuzzySuggestions(this.searchString, valueList, true);
            suggestions = fuzzySearchResult.values;

            const indices = fuzzySearchResult.indices;
            if (shouldFilterList && indices.length) {
                for (let i = 0; i < indices.length; i++) {
                    filteredValues.push(this.values[indices[i]]);
                }
            }
        } else {
            suggestions = valueList.filter((val, idx) => {
                const currentValue = val.toLocaleLowerCase();
                const valueToMatch = this.searchString.toLocaleLowerCase();

                const isMatch = searchType === 'match' ? currentValue.startsWith(valueToMatch) : currentValue.indexOf(valueToMatch) !== -1;
                if (shouldFilterList && isMatch) {
                    filteredValues.push(this.values[idx]);
                }
                return isMatch;
            });
        }

        return { suggestions, filteredValues };
    }

    private filterListModel(filteredValues: TValue[]): void {
        const { allowTyping,  filterList } = this.config;

        if (!allowTyping || !filterList) { return; }

        this.setValueList({ valueList: filteredValues, refresh: true });
    }

    private runSearch() {
        const { values } = this;
        const searchStrings = this.buildSearchStrings(values);

        if (!searchStrings) {
            this.highlightSelectedValue(-1);
            return;
        }

        const { suggestions, filteredValues } = this.getSuggestionsAndFilteredValues(this.searchString, searchStrings);
        const { allowTyping, filterList, highlightMatch, searchType = 'fuzzy' } = this.config;

        const filterValueLen = filteredValues.length;
        const shouldFilter = !!(allowTyping && filterList && this.searchString !== '');

        if (shouldFilter) {
            this.filterListModel(shouldFilter ? filteredValues : values);
        }

        if (suggestions.length) {
            const topSuggestionIndex = shouldFilter ? 0 : searchStrings.indexOf(suggestions[0]);
            this.selectListItem(topSuggestionIndex);
            if (highlightMatch && searchType !== 'fuzzy') {
                this.highlightFilterMatch();
            }
        } else {
            this.highlightSelectedValue(-1);
            
            if (!shouldFilter || filterValueLen) {
                this.listComponent?.ensureIndexVisible(0);
            } else if (shouldFilter) {
                this.getAriaElement().removeAttribute('data-active-option');
                const eListAriaEl = this.listComponent?.getAriaElement();
                if (eListAriaEl) {
                    setAriaActiveDescendant(eListAriaEl, null);
                }
            }
        }

        const eListGui = this.listComponent?.getGui();
        eListGui?.classList.toggle('ag-hidden', shouldFilter && !filterValueLen)
    }

    private clearSearchString(): void {
        this.searchString = '';
    }

    private selectListItem(index: number, preventUnnecessaryScroll?: boolean, skipRefresh?: boolean): void {
        if (!this.isPickerDisplayed || !this.listComponent || index < 0 || index >= this.currentList.length) { return; }

        const wasScrolled = this.listComponent.ensureIndexVisible(index, !preventUnnecessaryScroll);

        if (wasScrolled  && !skipRefresh) {
            this.listComponent.refresh(true);
        }
        this.highlightSelectedValue(index);
    }

    public setValue(value: TValue, silent?: boolean, fromPicker?: boolean): this {
        const index = this.currentList.indexOf(value);

        if (index === -1) { return this; }

        this.value = value;

        if (!fromPicker) {
            this.selectListItem(index);
        }

        this.renderSelectedValue();

        return super.setValue(value, silent);
    }

    private createRowComponent(value: TValue): Component {
        const row = new RichSelectRow<TValue>(this.config, this.eWrapper);
        row.setParentComponent(this.listComponent!);

        this.getContext().createBean(row);
        row.setState(value);

        const { highlightMatch, searchType = 'fuzzy' } = this.config;

        if (highlightMatch && searchType !== 'fuzzy') {
            row.highlightString(this.searchString);
        }

        return row;
    }

    private getRowForMouseEvent(e: MouseEvent): number {
        const { listComponent } = this;

        if (!listComponent) { return  -1; }


        const eGui = listComponent?.getGui();
        const rect = eGui.getBoundingClientRect();
        const scrollTop = listComponent.getScrollTop();
        const mouseY = e.clientY - rect.top + scrollTop;

        return Math.floor(mouseY / listComponent.getRowHeight());
    }

    private onPickerMouseMove(e: MouseEvent): void {
        if (!this.listComponent) { return; }
        const row = this.getRowForMouseEvent(e);

        if (row !== -1 && row != this.lastRowHovered) {
            this.lastRowHovered = row;
            this.selectListItem(row, true, true);
        }
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
        const newIndex = oldIndex === - 1 ? 0 : oldIndex + diff;

        this.selectListItem(newIndex, false, true);
    }

    private onEnterKeyDown(e: KeyboardEvent): void {
        if (!this.isPickerDisplayed) { return; }
        e.preventDefault();

        this.onListValueSelected(this.currentList[this.highlightedItem], true);
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
            value
        };

        this.dispatchEvent(event);
    }

    public getFocusableElement(): HTMLElement {
        const { allowTyping } = this.config;

        if (allowTyping) {
            return this.eInput.getFocusableElement();
        }

        return super.getFocusableElement();
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        const { allowTyping } = this.config;

        switch (key) {
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                if (!allowTyping) {
                    event.preventDefault();
                }
                break;
            case KeyCode.PAGE_UP:
            case KeyCode.PAGE_DOWN:
                event.preventDefault();
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
            case KeyCode.ESCAPE:
                if (this.isPickerDisplayed) {
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

    public destroy(): void {
        if (this.listComponent) {
            this.destroyBean(this.listComponent);
            this.listComponent = undefined;
        }

        this.eLoading = undefined;

        super.destroy();
    }

}