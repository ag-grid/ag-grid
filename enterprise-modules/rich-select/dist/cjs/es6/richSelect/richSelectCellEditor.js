"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const richSelectRow_1 = require("./richSelectRow");
class RichSelectCellEditor extends core_1.PopupComponent {
    constructor() {
        super(RichSelectCellEditor.TEMPLATE);
        this.selectionConfirmed = false;
        this.searchString = '';
    }
    init(params) {
        this.params = params;
        this.selectedValue = params.value;
        this.originalSelectedValue = params.value;
        this.focusAfterAttached = params.cellStartedEdit;
        const icon = core_1._.createIconNoSpan('smallDown', this.gridOptionsWrapper);
        icon.classList.add('ag-rich-select-value-icon');
        this.eValue.appendChild(icon);
        this.virtualList = this.getContext().createBean(new core_1.VirtualList('rich-select'));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());
        if (core_1._.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }
        this.renderSelectedValue();
        if (core_1._.missing(params.values)) {
            console.warn('AG Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        const values = params.values;
        this.virtualList.setModel({
            getRowCount: () => values.length,
            getRow: (index) => values[index]
        });
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        const virtualListGui = this.virtualList.getGui();
        this.addManagedListener(virtualListGui, 'click', this.onClick.bind(this));
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));
        const debounceDelay = core_1._.exists(params.searchDebounceDelay) ? params.searchDebounceDelay : 300;
        this.clearSearchString = core_1._.debounce(this.clearSearchString, debounceDelay);
        if (core_1._.exists(params.charPress)) {
            this.searchText(params.charPress);
        }
    }
    onKeyDown(event) {
        const key = event.key;
        event.preventDefault();
        switch (key) {
            case core_1.KeyCode.ENTER:
                this.onEnterKeyDown();
                break;
            case core_1.KeyCode.TAB:
                this.confirmSelection();
                break;
            case core_1.KeyCode.DOWN:
            case core_1.KeyCode.UP:
                this.onNavigationKeyPressed(event, key);
                break;
            default:
                this.searchText(event);
        }
    }
    confirmSelection() {
        this.selectionConfirmed = true;
    }
    onEnterKeyDown() {
        this.confirmSelection();
        this.params.stopEditing();
    }
    onNavigationKeyPressed(event, key) {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        const oldIndex = this.params.values.indexOf(this.selectedValue);
        const newIndex = key === core_1.KeyCode.UP ? oldIndex - 1 : oldIndex + 1;
        if (newIndex >= 0 && newIndex < this.params.values.length) {
            const valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    }
    searchText(key) {
        if (typeof key !== 'string') {
            let keyString = key.key;
            if (keyString === core_1.KeyCode.BACKSPACE) {
                this.searchString = this.searchString.slice(0, -1);
                keyString = '';
            }
            else if (!core_1._.isEventFromPrintableCharacter(key)) {
                return;
            }
            this.searchText(keyString);
            return;
        }
        this.searchString += key;
        this.runSearch();
        this.clearSearchString();
    }
    runSearch() {
        const values = this.params.values;
        let searchStrings;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(String);
        }
        if (typeof values[0] === 'object' && this.params.colDef.keyCreator) {
            searchStrings = values.map(value => {
                const keyParams = {
                    value: value,
                    colDef: this.params.colDef,
                    column: this.params.column,
                    node: this.params.node,
                    data: this.params.data,
                    api: this.gridOptionsWrapper.getApi(),
                    columnApi: this.gridOptionsWrapper.getColumnApi(),
                    context: this.gridOptionsWrapper.getContext()
                };
                return this.params.colDef.keyCreator(keyParams);
            });
        }
        if (!searchStrings) {
            return;
        }
        const topSuggestion = core_1._.fuzzySuggestions(this.searchString, searchStrings, true, true)[0];
        if (!topSuggestion) {
            return;
        }
        const topSuggestionIndex = searchStrings.indexOf(topSuggestion);
        const topValue = values[topSuggestionIndex];
        this.setSelectedValue(topValue);
    }
    clearSearchString() {
        this.searchString = '';
    }
    renderSelectedValue() {
        const valueFormatted = this.params.formatValue(this.selectedValue);
        const eValue = this.eValue;
        const params = {
            value: this.selectedValue,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi()
        };
        const compDetails = this.userComponentFactory.getCellRendererDetails(this.params, params);
        const promise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (promise) {
            core_1._.bindCellRendererToHtmlElement(promise, eValue);
            promise.then(renderer => {
                this.addDestroyFunc(() => this.getContext().destroyBean(renderer));
            });
        }
        else {
            if (core_1._.exists(this.selectedValue)) {
                eValue.innerHTML = valueFormatted;
            }
            else {
                core_1._.clearElement(eValue);
            }
        }
    }
    setSelectedValue(value) {
        if (this.selectedValue === value) {
            return;
        }
        const index = this.params.values.indexOf(value);
        if (index === -1) {
            return;
        }
        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);
        this.virtualList.forEachRenderedRow((cmp, idx) => {
            cmp.updateSelected(index === idx);
        });
        this.virtualList.focusRow(index);
    }
    createRowComponent(value) {
        const valueFormatted = this.params.formatValue(value);
        const row = new richSelectRow_1.RichSelectRow(this.params);
        this.getContext().createBean(row);
        row.setState(value, valueFormatted, value === this.selectedValue);
        return row;
    }
    onMouseMove(mouseEvent) {
        const rect = this.virtualList.getGui().getBoundingClientRect();
        const scrollTop = this.virtualList.getScrollTop();
        const mouseY = mouseEvent.clientY - rect.top + scrollTop;
        const row = Math.floor(mouseY / this.virtualList.getRowHeight());
        const value = this.params.values[row];
        // not using utils.exist() as want empty string test to pass
        if (value !== undefined) {
            this.setSelectedValue(value);
        }
    }
    onClick() {
        this.confirmSelection();
        this.params.stopEditing();
    }
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    afterGuiAttached() {
        const selectedIndex = this.params.values.indexOf(this.selectedValue);
        // we have to call this here to get the list to have the right height, ie
        // otherwise it would not have scrolls yet and ensureIndexVisible would do nothing
        this.virtualList.refresh();
        if (selectedIndex >= 0) {
            this.virtualList.ensureIndexVisible(selectedIndex);
        }
        // we call refresh again, as the list could of moved, and we need to render the new rows
        this.virtualList.refresh();
        if (this.focusAfterAttached) {
            const indexToSelect = selectedIndex !== -1 ? selectedIndex : 0;
            if (this.params.values.length) {
                this.virtualList.focusRow(indexToSelect);
            }
            else {
                this.getGui().focus();
            }
        }
    }
    getValue() {
        // NOTE: we don't use valueParser for Set Filter. The user should provide values that are to be
        // set into the data. valueParser only really makese sense when the user is typing in text (not picking
        // form a set).
        return this.selectionConfirmed ? this.selectedValue : this.originalSelectedValue;
    }
}
// tab index is needed so we can focus, which is needed for keyboard events
RichSelectCellEditor.TEMPLATE = `<div class="ag-rich-select" tabindex="-1">
            <div ref="eValue" class="ag-rich-select-value"></div>
            <div ref="eList" class="ag-rich-select-list"></div>
        </div>`;
__decorate([
    core_1.Autowired('userComponentFactory')
], RichSelectCellEditor.prototype, "userComponentFactory", void 0);
__decorate([
    core_1.RefSelector('eValue')
], RichSelectCellEditor.prototype, "eValue", void 0);
__decorate([
    core_1.RefSelector('eList')
], RichSelectCellEditor.prototype, "eList", void 0);
exports.RichSelectCellEditor = RichSelectCellEditor;
