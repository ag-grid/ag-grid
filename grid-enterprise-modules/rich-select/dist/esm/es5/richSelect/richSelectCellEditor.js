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
        var _a;
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
        if (((_a = params.eventKey) === null || _a === void 0 ? void 0 : _a.length) === 1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmljaFNlbGVjdENlbGxFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmljaFNlbGVjdC9yaWNoU2VsZWN0Q2VsbEVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUtULGNBQWMsRUFFZCxXQUFXLEVBQ1gsV0FBVyxFQUNYLE9BQU8sRUFFUCxDQUFDLEdBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXhEO0lBQTBDLHdDQUFjO0lBK0JwRDtRQUFBLFlBQ0ksa0JBQU0sb0JBQW9CLENBQUMsUUFBUSxDQUFDLFNBQ3ZDO1FBTE8sd0JBQWtCLEdBQUcsS0FBSyxDQUFDO1FBQzNCLGtCQUFZLEdBQUcsRUFBRSxDQUFDOztJQUkxQixDQUFDO0lBRU0sbUNBQUksR0FBWCxVQUFZLE1BQTZCOztRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDMUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFFakQsSUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN0RSxJQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUssQ0FBQyxDQUFDO1FBRS9CLElBQUksQ0FBQyxXQUFXLEdBQUcs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