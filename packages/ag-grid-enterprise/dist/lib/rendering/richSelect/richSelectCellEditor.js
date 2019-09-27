// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var richSelectRow_1 = require("./richSelectRow");
var virtualList_1 = require("../virtualList");
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
        this.eValue.appendChild(ag_grid_community_1._.createIconNoSpan('smallDown', this.gridOptionsWrapper));
        this.virtualList = new virtualList_1.VirtualList();
        this.getContext().wireBean(this.virtualList);
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());
        if (ag_grid_community_1._.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }
        this.renderSelectedValue();
        if (ag_grid_community_1._.missing(params.values)) {
            console.warn('ag-Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        var values = params.values;
        this.virtualList.setModel({
            getRowCount: function () { return values.length; },
            getRow: function (index) { return values[index]; }
        });
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        var virtualListGui = this.virtualList.getGui();
        this.addDestroyableEventListener(virtualListGui, 'click', this.onClick.bind(this));
        this.addDestroyableEventListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));
        this.clearSearchString = ag_grid_community_1._.debounce(this.clearSearchString, 300);
        if (ag_grid_community_1._.exists(params.charPress)) {
            this.searchText(params.charPress);
        }
    };
    RichSelectCellEditor.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        switch (key) {
            case ag_grid_community_1.Constants.KEY_ENTER:
                this.onEnterKeyDown();
                break;
            case ag_grid_community_1.Constants.KEY_DOWN:
            case ag_grid_community_1.Constants.KEY_UP:
                this.onNavigationKeyPressed(event, key);
                break;
            default:
                this.searchText(event);
        }
    };
    RichSelectCellEditor.prototype.onEnterKeyDown = function () {
        this.selectionConfirmed = true;
        this.params.stopEditing();
    };
    RichSelectCellEditor.prototype.onNavigationKeyPressed = function (event, key) {
        // if we don't stop propagation, then the grids navigation kicks in
        event.stopPropagation();
        var oldIndex = this.params.values.indexOf(this.selectedValue);
        var newIndex = key === ag_grid_community_1.Constants.KEY_UP ? oldIndex - 1 : oldIndex + 1;
        if (newIndex >= 0 && newIndex < this.params.values.length) {
            var valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    };
    RichSelectCellEditor.prototype.searchText = function (key) {
        if (typeof key !== 'string') {
            if (!ag_grid_community_1._.isCharacterKey(key)) {
                return;
            }
            key = key.key;
        }
        this.searchString += key;
        this.runSearch();
        this.clearSearchString();
    };
    RichSelectCellEditor.prototype.runSearch = function () {
        var suggestions = ag_grid_community_1._.fuzzySuggestions(this.searchString, this.params.values, true, true);
        if (!suggestions.length) {
            return;
        }
        this.setSelectedValue(suggestions[0]);
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
            api: this.gridOptionsWrapper.getApi()
        };
        var promise = this.userComponentFactory.newCellRenderer(this.params, params);
        if (promise != null) {
            ag_grid_community_1._.bindCellRendererToHtmlElement(promise, eValue);
        }
        else {
            eValue.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        if (promise) {
            promise.then(function (renderer) {
                if (renderer && renderer.destroy) {
                    _this.addDestroyFunc(function () { return renderer.destroy(); });
                }
            });
        }
        else {
            if (ag_grid_community_1._.exists(this.selectedValue)) {
                eValue.innerHTML = valueFormatted;
            }
            else {
                ag_grid_community_1._.clearElement(eValue);
            }
        }
    };
    RichSelectCellEditor.prototype.setSelectedValue = function (value) {
        if (this.selectedValue === value) {
            return;
        }
        var index = this.params.values.indexOf(value);
        if (index >= 0) {
            this.selectedValue = value;
            this.virtualList.ensureIndexVisible(index);
            this.virtualList.refresh();
        }
    };
    RichSelectCellEditor.prototype.createRowComponent = function (value) {
        var valueFormatted = this.params.formatValue(value);
        var row = new richSelectRow_1.RichSelectRow(this.params);
        this.getContext().wireBean(row);
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
        this.selectionConfirmed = true;
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
            this.getGui().focus();
        }
    };
    RichSelectCellEditor.prototype.getValue = function () {
        // NOTE: we don't use valueParser for Set Filter. The user should provide values that are to be
        // set into the data. valueParser only really makese sense when the user is typing in text (not picking
        // form a set).
        return this.selectionConfirmed ? this.selectedValue : this.originalSelectedValue;
    };
    // tab index is needed so we can focus, which is needed for keyboard events
    RichSelectCellEditor.TEMPLATE = "<div class=\"ag-rich-select\" tabindex=\"0\">\n            <div ref=\"eValue\" class=\"ag-rich-select-value\"></div>\n            <div ref=\"eList\" class=\"ag-rich-select-list\"></div>\n        </div>";
    __decorate([
        ag_grid_community_1.Autowired('userComponentFactory'),
        __metadata("design:type", ag_grid_community_1.UserComponentFactory)
    ], RichSelectCellEditor.prototype, "userComponentFactory", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], RichSelectCellEditor.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eValue'),
        __metadata("design:type", HTMLElement)
    ], RichSelectCellEditor.prototype, "eValue", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eList'),
        __metadata("design:type", HTMLElement)
    ], RichSelectCellEditor.prototype, "eList", void 0);
    return RichSelectCellEditor;
}(ag_grid_community_1.PopupComponent));
exports.RichSelectCellEditor = RichSelectCellEditor;
