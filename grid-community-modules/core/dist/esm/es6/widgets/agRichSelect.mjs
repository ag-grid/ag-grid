var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { KeyCode } from "../constants/keyCode.mjs";
import { Autowired } from "../context/context.mjs";
import { Events } from "../eventKeys.mjs";
import { setAriaControls } from "../utils/aria.mjs";
import { bindCellRendererToHtmlElement, clearElement } from "../utils/dom.mjs";
import { debounce } from "../utils/function.mjs";
import { fuzzySuggestions } from "../utils/fuzzyMatch.mjs";
import { exists } from "../utils/generic.mjs";
import { isEventFromPrintableCharacter } from "../utils/keyboard.mjs";
import { AgPickerField } from "./agPickerField.mjs";
import { RichSelectRow } from "./agRichSelectRow.mjs";
import { VirtualList } from "./virtualList.mjs";
export class AgRichSelect extends AgPickerField {
    constructor(config) {
        super(Object.assign({ pickerAriaLabelKey: 'ariaLabelRichSelectField', pickerAriaLabelValue: 'Rich Select Field', pickerType: 'ag-list' }, config), 'ag-rich-select', 'smallDown', 'combobox');
        this.searchString = '';
        this.highlightedItem = -1;
        const { cellRowHeight, value, valueList, searchDebounceDelay } = config || {};
        if (cellRowHeight) {
            this.cellRowHeight = cellRowHeight;
        }
        if (value != null) {
            this.value = value;
        }
        if (valueList != null) {
            this.setValueList(valueList);
        }
        if (searchDebounceDelay != null) {
            this.searchDebounceDelay = searchDebounceDelay;
        }
    }
    postConstruct() {
        var _a, _b;
        super.postConstruct();
        this.createListComponent();
        this.eWrapper.tabIndex = (_a = this.gridOptionsService.getNum('tabIndex')) !== null && _a !== void 0 ? _a : 0;
        this.eWrapper.classList.add('ag-rich-select-value');
        const debounceDelay = (_b = this.searchDebounceDelay) !== null && _b !== void 0 ? _b : 300;
        this.clearSearchString = debounce(this.clearSearchString, debounceDelay);
        this.renderSelectedValue();
    }
    createListComponent() {
        this.listComponent = this.createManagedBean(new VirtualList({ cssIdentifier: 'rich-select' }));
        this.listComponent.setComponentCreator(this.createRowComponent.bind(this));
        this.listComponent.setParentComponent(this);
        this.addManagedListener(this.listComponent, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, (e) => {
            this.onListValueSelected(e.value, e.fromEnterKey);
        });
        if (this.cellRowHeight) {
            this.listComponent.setRowHeight(this.cellRowHeight);
        }
        const eListGui = this.listComponent.getGui();
        const eListAriaEl = this.listComponent.getAriaElement();
        this.addManagedListener(eListGui, 'mousemove', this.onPickerMouseMove.bind(this));
        this.addManagedListener(eListGui, 'mousedown', e => e.preventDefault());
        eListGui.classList.add('ag-rich-select-list');
        const listId = `ag-rich-select-list-${this.listComponent.getCompId()}`;
        eListAriaEl.setAttribute('id', listId);
        setAriaControls(this.eWrapper, eListAriaEl);
    }
    renderSelectedValue() {
        const { value, eDisplayField, config } = this;
        const valueFormatted = this.config.valueFormatter ? this.config.valueFormatter(value) : value;
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
            }
            else {
                clearElement(eDisplayField);
            }
        }
    }
    setValueList(valueList) {
        this.values = valueList;
        this.highlightSelectedValue();
    }
    getCurrentValueIndex() {
        const { values, value } = this;
        if (value == null) {
            return -1;
        }
        for (let i = 0; i < values.length; i++) {
            if (values[i] === value) {
                return i;
            }
        }
        return -1;
    }
    highlightSelectedValue(index) {
        if (index == null) {
            index = this.getCurrentValueIndex();
        }
        if (index === -1) {
            return;
        }
        this.highlightedItem = index;
        if (this.listComponent) {
            this.listComponent.forEachRenderedRow((cmp, idx) => {
                cmp.updateHighlighted(this.highlightedItem === idx);
            });
        }
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
        this.listComponent.setModel({
            getRowCount: () => values.length,
            getRow: (index) => values[index]
        });
        // do not create the picker every time to save state
        return this.listComponent;
    }
    showPicker() {
        var _a, _b, _c;
        super.showPicker();
        const currentValueIndex = this.getCurrentValueIndex();
        if (currentValueIndex !== -1) {
            // make sure the virtual list has been sized correctly
            (_a = this.listComponent) === null || _a === void 0 ? void 0 : _a.refresh();
            (_b = this.listComponent) === null || _b === void 0 ? void 0 : _b.ensureIndexVisible(currentValueIndex);
            this.highlightSelectedValue(currentValueIndex);
        }
        else {
            (_c = this.listComponent) === null || _c === void 0 ? void 0 : _c.refresh();
        }
    }
    beforeHidePicker() {
        this.highlightedItem = -1;
        super.beforeHidePicker();
    }
    searchText(searchKey) {
        if (typeof searchKey !== 'string') {
            let { key } = searchKey;
            if (key === KeyCode.BACKSPACE) {
                this.searchString = this.searchString.slice(0, -1);
                key = '';
            }
            else if (!isEventFromPrintableCharacter(searchKey)) {
                return;
            }
            searchKey.preventDefault();
            this.searchText(key);
            return;
        }
        this.searchString += searchKey;
        this.runSearch();
        this.clearSearchString();
    }
    runSearch() {
        const values = this.values;
        let searchStrings;
        const { valueFormatter = (value => value), searchStringCreator } = this.config;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(v => valueFormatter(v));
        }
        else if (typeof values[0] === 'object' && searchStringCreator) {
            searchStrings = searchStringCreator(values);
        }
        if (!searchStrings) {
            return;
        }
        const topSuggestion = fuzzySuggestions(this.searchString, searchStrings, true)[0];
        if (!topSuggestion) {
            return;
        }
        const topSuggestionIndex = searchStrings.indexOf(topSuggestion);
        this.selectListItem(topSuggestionIndex);
    }
    clearSearchString() {
        this.searchString = '';
    }
    selectListItem(index) {
        if (!this.isPickerDisplayed || !this.listComponent || index < 0 || index >= this.values.length) {
            return;
        }
        this.listComponent.ensureIndexVisible(index);
        this.highlightSelectedValue(index);
    }
    setValue(value, silent, fromPicker) {
        const index = this.values.indexOf(value);
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
        row.setState(value, value === this.value);
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
        if (row !== -1) {
            this.selectListItem(row);
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
        this.onListValueSelected(this.values[this.highlightedItem], true);
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
    onKeyDown(event) {
        const key = event.key;
        switch (key) {
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
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
                this.searchText(event);
        }
    }
}
__decorate([
    Autowired('userComponentFactory')
], AgRichSelect.prototype, "userComponentFactory", void 0);
