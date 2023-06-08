var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PopupComponent, RefSelector, VirtualList, KeyCode, _, } from "@ag-grid-community/core";
import { RichSelectRow } from "./richSelectRow";
import { bindCellRendererToHtmlElement } from "./utils";
export class RichSelectCellEditor extends PopupComponent {
    constructor() {
        super(RichSelectCellEditor.TEMPLATE);
        this.selectionConfirmed = false;
        this.searchString = '';
    }
    init(params) {
        var _a;
        this.params = params;
        this.selectedValue = params.value;
        this.originalSelectedValue = params.value;
        this.focusAfterAttached = params.cellStartedEdit;
        const icon = _.createIconNoSpan('smallDown', this.gridOptionsService);
        icon.classList.add('ag-rich-select-value-icon');
        this.eValue.appendChild(icon);
        this.virtualList = this.createManagedBean(new VirtualList('rich-select'));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());
        if (_.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }
        this.renderSelectedValue();
        if (_.missing(params.values)) {
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
        const debounceDelay = _.exists(params.searchDebounceDelay) ? params.searchDebounceDelay : 300;
        this.clearSearchString = _.debounce(this.clearSearchString, debounceDelay);
        if (((_a = params.eventKey) === null || _a === void 0 ? void 0 : _a.length) === 1) {
            this.searchText(params.eventKey);
        }
    }
    onKeyDown(event) {
        const key = event.key;
        event.preventDefault();
        switch (key) {
            case KeyCode.ENTER:
                this.onEnterKeyDown();
                break;
            case KeyCode.TAB:
                this.confirmSelection();
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
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
    onNavigationKeyDown(event, key) {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        const oldIndex = this.params.values.indexOf(this.selectedValue);
        const newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;
        if (newIndex >= 0 && newIndex < this.params.values.length) {
            const valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    }
    searchText(key) {
        if (typeof key !== 'string') {
            let keyString = key.key;
            if (keyString === KeyCode.BACKSPACE) {
                this.searchString = this.searchString.slice(0, -1);
                keyString = '';
            }
            else if (!_.isEventFromPrintableCharacter(key)) {
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
            searchStrings = values.map(v => this.params.formatValue(v));
        }
        if (typeof values[0] === 'object' && this.params.colDef.keyCreator) {
            searchStrings = values.map(value => {
                const keyParams = {
                    value: value,
                    colDef: this.params.colDef,
                    column: this.params.column,
                    node: this.params.node,
                    data: this.params.data,
                    api: this.gridOptionsService.api,
                    columnApi: this.gridOptionsService.columnApi,
                    context: this.gridOptionsService.context
                };
                return this.params.colDef.keyCreator(keyParams);
            });
        }
        if (!searchStrings) {
            return;
        }
        const topSuggestion = _.fuzzySuggestions(this.searchString, searchStrings, true)[0];
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
            api: this.gridOptionsService.api,
        };
        const compDetails = this.userComponentFactory.getCellRendererDetails(this.params, params);
        const promise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (promise) {
            bindCellRendererToHtmlElement(promise, eValue);
            promise.then(renderer => {
                this.addDestroyFunc(() => this.getContext().destroyBean(renderer));
            });
        }
        else {
            if (_.exists(this.selectedValue)) {
                eValue.innerText = valueFormatted;
            }
            else {
                _.clearElement(eValue);
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
        const row = new RichSelectRow(this.params);
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
    Autowired('userComponentFactory')
], RichSelectCellEditor.prototype, "userComponentFactory", void 0);
__decorate([
    RefSelector('eValue')
], RichSelectCellEditor.prototype, "eValue", void 0);
__decorate([
    RefSelector('eList')
], RichSelectCellEditor.prototype, "eList", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmljaFNlbGVjdENlbGxFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmljaFNlbGVjdC9yaWNoU2VsZWN0Q2VsbEVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUtULGNBQWMsRUFFZCxXQUFXLEVBQ1gsV0FBVyxFQUNYLE9BQU8sRUFFUCxDQUFDLEdBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXhELE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxjQUFjO0lBK0JwRDtRQUNJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUpqQyx1QkFBa0IsR0FBRyxLQUFLLENBQUM7UUFDM0IsaUJBQVksR0FBRyxFQUFFLENBQUM7SUFJMUIsQ0FBQztJQUVNLElBQUksQ0FBQyxNQUE2Qjs7UUFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO1FBRWpELE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDdEUsSUFBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFLLENBQUMsQ0FBQztRQUUvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FB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