var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { KeyCode } from "../constants/keyCode.mjs";
import { Autowired } from "../context/context.mjs";
import { Events } from "../eventKeys.mjs";
import { setAriaActiveDescendant, setAriaControls, setAriaLabel } from "../utils/aria.mjs";
import { bindCellRendererToHtmlElement, clearElement, isVisible } from "../utils/dom.mjs";
import { stopPropagationForAgGrid } from "../utils/event.mjs";
import { debounce } from "../utils/function.mjs";
import { fuzzySuggestions } from "../utils/fuzzyMatch.mjs";
import { exists } from "../utils/generic.mjs";
import { isEventFromPrintableCharacter } from "../utils/keyboard.mjs";
import { escapeString } from "../utils/string.mjs";
import { AgPickerField } from "./agPickerField.mjs";
import { RichSelectRow } from "./agRichSelectRow.mjs";
import { RefSelector } from "./componentAnnotations.mjs";
import { VirtualList } from "./virtualList.mjs";
const TEMPLATE = /* html */ `
    <div class="ag-picker-field" role="presentation">
        <div ref="eLabel"></div>
            <div ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper ag-rich-select-value ag-picker-collapsed">
            <div ref="eDisplayField" class="ag-picker-field-display"></div>
            <ag-input-text-field ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
            <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
        </div>
    </div>`;
export class AgRichSelect extends AgPickerField {
    constructor(config) {
        var _a, _b;
        super(Object.assign(Object.assign({ pickerAriaLabelKey: 'ariaLabelRichSelectField', pickerAriaLabelValue: 'Rich Select Field', pickerType: 'ag-list', className: 'ag-rich-select', pickerIcon: 'smallDown', ariaRole: 'combobox', template: (_a = config === null || config === void 0 ? void 0 : config.template) !== null && _a !== void 0 ? _a : TEMPLATE, modalPicker: false }, config), { 
            // maxPickerHeight needs to be set after expanding `config`
            maxPickerHeight: (_b = config === null || config === void 0 ? void 0 : config.maxPickerHeight) !== null && _b !== void 0 ? _b : 'calc(var(--ag-row-height) * 6.5)' }));
        this.searchString = '';
        this.highlightedItem = -1;
        this.lastRowHovered = -1;
        this.searchStringCreator = null;
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
    postConstruct() {
        super.postConstruct();
        this.createLoadingElement();
        this.createListComponent();
        const { allowTyping, placeholder } = this.config;
        if (allowTyping) {
            this.eInput
                .setAutoComplete(false)
                .setInputPlaceholder(placeholder);
            this.eDisplayField.classList.add('ag-hidden');
        }
        else {
            this.eInput.setDisplayed(false);
        }
        this.eWrapper.tabIndex = this.gridOptionsService.get('tabIndex');
        const { searchDebounceDelay = 300 } = this.config;
        this.clearSearchString = debounce(this.clearSearchString, searchDebounceDelay);
        this.renderSelectedValue();
        if (allowTyping) {
            this.eInput.onValueChange(value => this.searchTextFromString(value));
            this.addManagedListener(this.eWrapper, 'focus', this.onWrapperFocus.bind(this));
        }
        this.addManagedListener(this.eWrapper, 'focusout', this.onWrapperFocusOut.bind(this));
    }
    createLoadingElement() {
        const eDocument = this.gridOptionsService.getDocument();
        const translate = this.localeService.getLocaleTextFunc();
        const el = eDocument.createElement('div');
        el.classList.add('ag-loading-text');
        el.innerText = translate('loadingOoo', 'Loading...');
        this.eLoading = el;
    }
    createListComponent() {
        this.listComponent = this.createBean(new VirtualList({ cssIdentifier: 'rich-select' }));
        this.listComponent.setComponentCreator(this.createRowComponent.bind(this));
        this.listComponent.setParentComponent(this);
        this.addManagedListener(this.listComponent, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, (e) => {
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
    renderSelectedValue() {
        const { value, eDisplayField, config } = this;
        const { allowTyping, initialInputValue } = this.config;
        const valueFormatted = this.config.valueFormatter ? this.config.valueFormatter(value) : value;
        if (allowTyping) {
            this.eInput.setValue(initialInputValue !== null && initialInputValue !== void 0 ? initialInputValue : valueFormatted);
            return;
        }
        let userCompDetails;
        if (config.cellRenderer) {
            userCompDetails = this.userComponentFactory.getCellRendererDetails(this.config, {
                value,
                valueFormatted,
                api: this.gridOptionsService.api
            });
        }
        let userCompDetailsPromise;
        if (userCompDetails) {
            userCompDetailsPromise = userCompDetails.newAgStackInstance();
        }
        if (userCompDetailsPromise) {
            clearElement(eDisplayField);
            bindCellRendererToHtmlElement(userCompDetailsPromise, eDisplayField);
            userCompDetailsPromise.then(renderer => {
                this.addDestroyFunc(() => this.getContext().destroyBean(renderer));
            });
        }
        else {
            if (exists(this.value)) {
                eDisplayField.innerText = valueFormatted;
                eDisplayField.classList.remove('ag-display-as-placeholder');
            }
            else {
                const { placeholder } = config;
                if (exists(placeholder)) {
                    eDisplayField.innerHTML = `${escapeString(placeholder)}`;
                    eDisplayField.classList.add('ag-display-as-placeholder');
                }
                else {
                    clearElement(eDisplayField);
                }
            }
        }
    }
    getCurrentValueIndex() {
        const { currentList, value } = this;
        if (value == null) {
            return -1;
        }
        for (let i = 0; i < currentList.length; i++) {
            if (currentList[i] === value) {
                return i;
            }
        }
        return -1;
    }
    highlightFilterMatch() {
        var _a;
        (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.forEachRenderedRow((cmp, idx) => {
            cmp.highlightString(this.searchString);
        });
    }
    highlightSelectedValue(index) {
        var _a;
        if (index == null) {
            index = this.getCurrentValueIndex();
        }
        this.highlightedItem = index;
        (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.forEachRenderedRow((cmp, idx) => {
            const highlighted = index === -1 ? false : this.highlightedItem === idx;
            cmp.updateHighlighted(highlighted);
        });
    }
    setRowHeight(height) {
        if (height !== this.cellRowHeight) {
            this.cellRowHeight = height;
        }
        if (this.listComponent) {
            this.listComponent.setRowHeight(height);
        }
    }
    createPickerComponent() {
        const { values } = this;
        if (values) {
            this.setValueList({ valueList: values });
        }
        // do not create the picker every time to save state
        return this.listComponent;
    }
    setSearchStringCreator(searchStringFn) {
        this.searchStringCreator = searchStringFn;
    }
    setValueList(params) {
        const { valueList, refresh } = params;
        if (!this.listComponent) {
            return;
        }
        if (this.currentList === valueList) {
            return;
        }
        this.currentList = valueList;
        this.listComponent.setModel({
            getRowCount: () => valueList.length,
            getRow: (index) => valueList[index]
        });
        if (refresh) {
            // if `values` is not present, it means the valuesList was set asynchronously
            if (!this.values) {
                this.values = valueList;
                if (this.isPickerDisplayed) {
                    this.showCurrentValueInPicker();
                }
            }
            else {
                this.listComponent.refresh();
            }
        }
    }
    showPicker() {
        super.showPicker();
        this.showCurrentValueInPicker();
        this.displayOrHidePicker();
    }
    showCurrentValueInPicker() {
        var _a, _b;
        if (!this.listComponent) {
            return;
        }
        if (!this.currentList) {
            if (this.isPickerDisplayed && this.eLoading) {
                this.listComponent.appendChild(this.eLoading);
            }
            return;
        }
        if ((_a = this.eLoading) === null || _a === void 0 ? void 0 : _a.offsetParent) {
            (_b = this.eLoading.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(this.eLoading);
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
        }
        else {
            this.listComponent.refresh();
        }
    }
    beforeHidePicker() {
        this.highlightedItem = -1;
        super.beforeHidePicker();
    }
    onWrapperFocus() {
        if (!this.eInput) {
            return;
        }
        const focusableEl = this.eInput.getFocusableElement();
        focusableEl.focus();
        focusableEl.select();
    }
    onWrapperFocusOut(e) {
        if (!this.eWrapper.contains(e.relatedTarget)) {
            this.hidePicker();
        }
    }
    buildSearchStringFromKeyboardEvent(searchKey) {
        let { key } = searchKey;
        if (key === KeyCode.BACKSPACE) {
            this.searchString = this.searchString.slice(0, -1);
            key = '';
        }
        else if (!isEventFromPrintableCharacter(searchKey)) {
            return;
        }
        searchKey.preventDefault();
        this.searchTextFromCharacter(key);
    }
    searchTextFromCharacter(char) {
        this.searchString += char;
        this.runSearch();
        this.clearSearchString();
    }
    searchTextFromString(str) {
        if (str == null) {
            str = '';
        }
        this.searchString = str;
        this.runSearch();
    }
    buildSearchStrings(values) {
        const { valueFormatter = (value => value) } = this.config;
        let searchStrings;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(v => valueFormatter(v));
        }
        else if (typeof values[0] === 'object' && this.searchStringCreator) {
            searchStrings = this.searchStringCreator(values);
        }
        return searchStrings;
    }
    getSuggestionsAndFilteredValues(searchValue, valueList) {
        let suggestions = [];
        let filteredValues = [];
        if (!searchValue.length) {
            return { suggestions, filteredValues };
        }
        ;
        const { searchType = 'fuzzy', filterList } = this.config;
        if (searchType === 'fuzzy') {
            const fuzzySearchResult = fuzzySuggestions(this.searchString, valueList, true);
            suggestions = fuzzySearchResult.values;
            const indices = fuzzySearchResult.indices;
            if (filterList && indices.length) {
                for (let i = 0; i < indices.length; i++) {
                    filteredValues.push(this.values[indices[i]]);
                }
            }
        }
        else {
            suggestions = valueList.filter((val, idx) => {
                const currentValue = val.toLocaleLowerCase();
                const valueToMatch = this.searchString.toLocaleLowerCase();
                const isMatch = searchType === 'match' ? currentValue.startsWith(valueToMatch) : currentValue.indexOf(valueToMatch) !== -1;
                if (filterList && isMatch) {
                    filteredValues.push(this.values[idx]);
                }
                return isMatch;
            });
        }
        return { suggestions, filteredValues };
    }
    filterListModel(filteredValues) {
        const { filterList } = this.config;
        if (!filterList) {
            return;
        }
        this.setValueList({ valueList: filteredValues, refresh: true });
        this.alignPickerToComponent();
    }
    runSearch() {
        var _a, _b;
        const { values } = this;
        const searchStrings = this.buildSearchStrings(values);
        if (!searchStrings) {
            this.highlightSelectedValue(-1);
            return;
        }
        const { suggestions, filteredValues } = this.getSuggestionsAndFilteredValues(this.searchString, searchStrings);
        const { filterList, highlightMatch, searchType = 'fuzzy' } = this.config;
        const filterValueLen = filteredValues.length;
        const shouldFilter = !!(filterList && this.searchString !== '');
        this.filterListModel(shouldFilter ? filteredValues : values);
        if (suggestions.length) {
            const topSuggestionIndex = shouldFilter ? 0 : searchStrings.indexOf(suggestions[0]);
            this.selectListItem(topSuggestionIndex);
        }
        else {
            this.highlightSelectedValue(-1);
            if (!shouldFilter || filterValueLen) {
                (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.ensureIndexVisible(0);
            }
            else if (shouldFilter) {
                this.getAriaElement().removeAttribute('data-active-option');
                const eListAriaEl = (_b = this.listComponent) === null || _b === void 0 ? void 0 : _b.getAriaElement();
                if (eListAriaEl) {
                    setAriaActiveDescendant(eListAriaEl, null);
                }
            }
        }
        if (highlightMatch && searchType !== 'fuzzy') {
            this.highlightFilterMatch();
        }
        this.displayOrHidePicker();
    }
    displayOrHidePicker() {
        var _a;
        const eListGui = (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.getGui();
        eListGui === null || eListGui === void 0 ? void 0 : eListGui.classList.toggle('ag-hidden', this.currentList.length === 0);
    }
    clearSearchString() {
        this.searchString = '';
    }
    selectListItem(index, preventUnnecessaryScroll) {
        if (!this.isPickerDisplayed || !this.listComponent || index < 0 || index >= this.currentList.length) {
            return;
        }
        const wasScrolled = this.listComponent.ensureIndexVisible(index, !preventUnnecessaryScroll);
        if (wasScrolled && !preventUnnecessaryScroll) {
            this.listComponent.refresh(true);
        }
        this.highlightSelectedValue(index);
    }
    setValue(value, silent, fromPicker) {
        const index = this.currentList.indexOf(value);
        if (index === -1) {
            return this;
        }
        this.value = value;
        if (!fromPicker) {
            this.selectListItem(index);
        }
        this.renderSelectedValue();
        return super.setValue(value, silent);
    }
    createRowComponent(value) {
        const row = new RichSelectRow(this.config, this.eWrapper);
        row.setParentComponent(this.listComponent);
        this.getContext().createBean(row);
        row.setState(value);
        const { highlightMatch, searchType = 'fuzzy' } = this.config;
        if (highlightMatch && searchType !== 'fuzzy') {
            row.highlightString(this.searchString);
        }
        return row;
    }
    getRowForMouseEvent(e) {
        const { listComponent } = this;
        if (!listComponent) {
            return -1;
        }
        const eGui = listComponent === null || listComponent === void 0 ? void 0 : listComponent.getGui();
        const rect = eGui.getBoundingClientRect();
        const scrollTop = listComponent.getScrollTop();
        const mouseY = e.clientY - rect.top + scrollTop;
        return Math.floor(mouseY / listComponent.getRowHeight());
    }
    onPickerMouseMove(e) {
        if (!this.listComponent) {
            return;
        }
        const row = this.getRowForMouseEvent(e);
        if (row !== -1 && row != this.lastRowHovered) {
            this.lastRowHovered = row;
            this.selectListItem(row, true);
        }
    }
    onNavigationKeyDown(event, key) {
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
        this.selectListItem(newIndex);
    }
    onEnterKeyDown(e) {
        if (!this.isPickerDisplayed) {
            return;
        }
        e.preventDefault();
        this.onListValueSelected(this.currentList[this.highlightedItem], true);
    }
    onTabKeyDown() {
        if (!this.isPickerDisplayed) {
            return;
        }
        this.setValue(this.currentList[this.highlightedItem], false, true);
    }
    onListValueSelected(value, fromEnterKey) {
        this.setValue(value, false, true);
        this.dispatchPickerEvent(value, fromEnterKey);
        this.hidePicker();
    }
    dispatchPickerEvent(value, fromEnterKey) {
        const event = {
            type: Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey,
            value
        };
        this.dispatchEvent(event);
    }
    getFocusableElement() {
        const { allowTyping } = this.config;
        if (allowTyping) {
            return this.eInput.getFocusableElement();
        }
        return super.getFocusableElement();
    }
    onKeyDown(event) {
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
                    if (isVisible(this.listComponent.getGui())) {
                        event.preventDefault();
                        stopPropagationForAgGrid(event);
                    }
                    this.hidePicker();
                }
                break;
            case KeyCode.ENTER:
                this.onEnterKeyDown(event);
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
    destroy() {
        if (this.listComponent) {
            this.destroyBean(this.listComponent);
            this.listComponent = undefined;
        }
        this.eLoading = undefined;
        super.destroy();
    }
}
__decorate([
    Autowired('userComponentFactory')
], AgRichSelect.prototype, "userComponentFactory", void 0);
__decorate([
    RefSelector('eInput')
], AgRichSelect.prototype, "eInput", void 0);
