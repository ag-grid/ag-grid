var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PopupComponent, RefSelector, VirtualList, KeyCode, _, } from "@ag-grid-community/core";
import { RichSelectRow } from "./richSelectRow";
import { bindCellRendererToHtmlElement } from "./utils";
var RichSelectCellEditor = /** @class */ (function (_super) {
    __extends(RichSelectCellEditor, _super);
    function RichSelectCellEditor() {
        var _this = _super.call(this, RichSelectCellEditor.TEMPLATE) || this;
        _this.selectionConfirmed = false;
        _this.searchString = '';
        return _this;
    }
    RichSelectCellEditor.prototype.init = function (params) {
        this.params = params;
        this.selectedValue = params.value;
        this.originalSelectedValue = params.value;
        this.focusAfterAttached = params.cellStartedEdit;
        var icon = _.createIconNoSpan('smallDown', this.gridOptionsService);
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
        var values = params.values;
        this.virtualList.setModel({
            getRowCount: function () { return values.length; },
            getRow: function (index) { return values[index]; }
        });
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        var virtualListGui = this.virtualList.getGui();
        this.addManagedListener(virtualListGui, 'click', this.onClick.bind(this));
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));
        var debounceDelay = _.exists(params.searchDebounceDelay) ? params.searchDebounceDelay : 300;
        this.clearSearchString = _.debounce(this.clearSearchString, debounceDelay);
        if (_.exists(params.eventKey)) {
            this.searchText(params.eventKey);
        }
    };
    RichSelectCellEditor.prototype.onKeyDown = function (event) {
        var key = event.key;
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
    };
    RichSelectCellEditor.prototype.confirmSelection = function () {
        this.selectionConfirmed = true;
    };
    RichSelectCellEditor.prototype.onEnterKeyDown = function () {
        this.confirmSelection();
        this.params.stopEditing();
    };
    RichSelectCellEditor.prototype.onNavigationKeyDown = function (event, key) {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        var oldIndex = this.params.values.indexOf(this.selectedValue);
        var newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;
        if (newIndex >= 0 && newIndex < this.params.values.length) {
            var valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    };
    RichSelectCellEditor.prototype.searchText = function (key) {
        if (typeof key !== 'string') {
            var keyString = key.key;
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
    };
    RichSelectCellEditor.prototype.runSearch = function () {
        var _this = this;
        var values = this.params.values;
        var searchStrings;
        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(function (v) { return _this.params.formatValue(v); });
        }
        if (typeof values[0] === 'object' && this.params.colDef.keyCreator) {
            searchStrings = values.map(function (value) {
                var keyParams = {
                    value: value,
                    colDef: _this.params.colDef,
                    column: _this.params.column,
                    node: _this.params.node,
                    data: _this.params.data,
                    api: _this.gridOptionsService.api,
                    columnApi: _this.gridOptionsService.columnApi,
                    context: _this.gridOptionsService.context
                };
                return _this.params.colDef.keyCreator(keyParams);
            });
        }
        if (!searchStrings) {
            return;
        }
        var topSuggestion = _.fuzzySuggestions(this.searchString, searchStrings, true)[0];
        if (!topSuggestion) {
            return;
        }
        var topSuggestionIndex = searchStrings.indexOf(topSuggestion);
        var topValue = values[topSuggestionIndex];
        this.setSelectedValue(topValue);
    };
    RichSelectCellEditor.prototype.clearSearchString = function () {
        this.searchString = '';
    };
    RichSelectCellEditor.prototype.renderSelectedValue = function () {
        var _this = this;
        var valueFormatted = this.params.formatValue(this.selectedValue);
        var eValue = this.eValue;
        var params = {
            value: this.selectedValue,
            valueFormatted: valueFormatted,
            api: this.gridOptionsService.api,
        };
        var compDetails = this.userComponentFactory.getCellRendererDetails(this.params, params);
        var promise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (promise) {
            bindCellRendererToHtmlElement(promise, eValue);
            promise.then(function (renderer) {
                _this.addDestroyFunc(function () { return _this.getContext().destroyBean(renderer); });
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
    };
    RichSelectCellEditor.prototype.setSelectedValue = function (value) {
        if (this.selectedValue === value) {
            return;
        }
        var index = this.params.values.indexOf(value);
        if (index === -1) {
            return;
        }
        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);
        this.virtualList.forEachRenderedRow(function (cmp, idx) {
            cmp.updateSelected(index === idx);
        });
        this.virtualList.focusRow(index);
    };
    RichSelectCellEditor.prototype.createRowComponent = function (value) {
        var valueFormatted = this.params.formatValue(value);
        var row = new RichSelectRow(this.params);
        this.getContext().createBean(row);
        row.setState(value, valueFormatted, value === this.selectedValue);
        return row;
    };
    RichSelectCellEditor.prototype.onMouseMove = function (mouseEvent) {
        var rect = this.virtualList.getGui().getBoundingClientRect();
        var scrollTop = this.virtualList.getScrollTop();
        var mouseY = mouseEvent.clientY - rect.top + scrollTop;
        var row = Math.floor(mouseY / this.virtualList.getRowHeight());
        var value = this.params.values[row];
        // not using utils.exist() as want empty string test to pass
        if (value !== undefined) {
            this.setSelectedValue(value);
        }
    };
    RichSelectCellEditor.prototype.onClick = function () {
        this.confirmSelection();
        this.params.stopEditing();
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    RichSelectCellEditor.prototype.afterGuiAttached = function () {
        var selectedIndex = this.params.values.indexOf(this.selectedValue);
        // we have to call this here to get the list to have the right height, ie
        // otherwise it would not have scrolls yet and ensureIndexVisible would do nothing
        this.virtualList.refresh();
        if (selectedIndex >= 0) {
            this.virtualList.ensureIndexVisible(selectedIndex);
        }
        // we call refresh again, as the list could of moved, and we need to render the new rows
        this.virtualList.refresh();
        if (this.focusAfterAttached) {
            var indexToSelect = selectedIndex !== -1 ? selectedIndex : 0;
            if (this.params.values.length) {
                this.virtualList.focusRow(indexToSelect);
            }
            else {
                this.getGui().focus();
            }
        }
    };
    RichSelectCellEditor.prototype.getValue = function () {
        // NOTE: we don't use valueParser for Set Filter. The user should provide values that are to be
        // set into the data. valueParser only really makese sense when the user is typing in text (not picking
        // form a set).
        return this.selectionConfirmed ? this.selectedValue : this.originalSelectedValue;
    };
    // tab index is needed so we can focus, which is needed for keyboard events
    RichSelectCellEditor.TEMPLATE = "<div class=\"ag-rich-select\" tabindex=\"-1\">\n            <div ref=\"eValue\" class=\"ag-rich-select-value\"></div>\n            <div ref=\"eList\" class=\"ag-rich-select-list\"></div>\n        </div>";
    __decorate([
        Autowired('userComponentFactory')
    ], RichSelectCellEditor.prototype, "userComponentFactory", void 0);
    __decorate([
        RefSelector('eValue')
    ], RichSelectCellEditor.prototype, "eValue", void 0);
    __decorate([
        RefSelector('eList')
    ], RichSelectCellEditor.prototype, "eList", void 0);
    return RichSelectCellEditor;
}(PopupComponent));
export { RichSelectCellEditor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmljaFNlbGVjdENlbGxFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmljaFNlbGVjdC9yaWNoU2VsZWN0Q2VsbEVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUtULGNBQWMsRUFFZCxXQUFXLEVBQ1gsV0FBVyxFQUNYLE9BQU8sRUFFUCxDQUFDLEdBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXhEO0lBQTBDLHdDQUFjO0lBK0JwRDtRQUFBLFlBQ0ksa0JBQU0sb0JBQW9CLENBQUMsUUFBUSxDQUFDLFNBQ3ZDO1FBTE8sd0JBQWtCLEdBQUcsS0FBSyxDQUFDO1FBQzNCLGtCQUFZLEdBQUcsRUFBRSxDQUFDOztJQUkxQixDQUFDO0lBRU0sbUNBQUksR0FBWCxVQUFZLE1BQTZCO1FBQ3JDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNsQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMxQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQztRQUVqRCxJQUFNLElBQUksR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3RFLElBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSyxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJ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