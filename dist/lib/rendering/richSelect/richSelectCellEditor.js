// ag-grid-enterprise v16.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var main_1 = require("ag-grid/main");
var richSelectRow_1 = require("./richSelectRow");
var virtualList_1 = require("../virtualList");
var ag_grid_1 = require("ag-grid");
var RichSelectCellEditor = (function (_super) {
    __extends(RichSelectCellEditor, _super);
    function RichSelectCellEditor() {
        var _this = _super.call(this, RichSelectCellEditor.TEMPLATE) || this;
        _this.selectionConfirmed = false;
        return _this;
    }
    RichSelectCellEditor.prototype.init = function (params) {
        this.params = params;
        this.selectedValue = params.value;
        this.originalSelectedValue = params.value;
        this.focusAfterAttached = params.cellStartedEdit;
        this.virtualList = new virtualList_1.VirtualList();
        this.context.wireBean(this.virtualList);
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.getRefElement('eList').appendChild(this.virtualList.getGui());
        if (main_1.Utils.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }
        this.renderSelectedValue();
        if (main_1.Utils.missing(params.values)) {
            console.log('ag-Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        var values = params.values;
        this.virtualList.setModel({
            getRowCount: function () { return values.length; },
            getRow: function (index) { return values[index]; }
        });
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        this.addDestroyableEventListener(this.virtualList.getGui(), 'click', this.onClick.bind(this));
        this.addDestroyableEventListener(this.virtualList.getGui(), 'mousemove', this.onMouseMove.bind(this));
    };
    RichSelectCellEditor.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        switch (key) {
            case main_1.Constants.KEY_ENTER:
                this.onEnterKeyDown();
                break;
            case main_1.Constants.KEY_DOWN:
            case main_1.Constants.KEY_UP:
                this.onNavigationKeyPressed(event, key);
                break;
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
        var newIndex = key === main_1.Constants.KEY_UP ? oldIndex - 1 : oldIndex + 1;
        if (newIndex >= 0 && newIndex < this.params.values.length) {
            var valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    };
    RichSelectCellEditor.prototype.renderSelectedValue = function () {
        var _this = this;
        var valueFormatted = this.params.formatValue(this.selectedValue);
        var eValue = this.getRefElement('eValue');
        var promise = this.cellRendererService.useRichSelectCellRenderer(this.params.column.getColDef(), eValue, { value: this.selectedValue, valueFormatted: valueFormatted });
        var foundRenderer = ag_grid_1._.exists(promise);
        if (foundRenderer) {
            promise.then(function (renderer) {
                if (renderer && renderer.destroy) {
                    _this.addDestroyFunc(function () { return renderer.destroy(); });
                }
            });
        }
        else {
            if (main_1.Utils.exists(this.selectedValue)) {
                eValue.innerHTML = valueFormatted;
            }
            else {
                eValue.innerHTML = '';
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
        var row = new richSelectRow_1.RichSelectRow(this.params.column.getColDef());
        this.context.wireBean(row);
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
        // otherwise it would not have scrolls yet and ensureIndeVisible would do nothing
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
        if (this.selectionConfirmed) {
            return this.selectedValue;
        }
        else {
            return this.originalSelectedValue;
        }
    };
    RichSelectCellEditor.prototype.isPopup = function () {
        return true;
    };
    RichSelectCellEditor.TEMPLATE = 
    // tab index is needed so we can focus, which is needed for keyboard events
    '<div class="ag-rich-select" tabindex="0">' +
        '<div ref="eValue" class="ag-rich-select-value"></div>' +
        '<div ref="eList" class="ag-rich-select-list"></div>' +
        '</div>';
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], RichSelectCellEditor.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('cellRendererService'),
        __metadata("design:type", main_1.CellRendererService)
    ], RichSelectCellEditor.prototype, "cellRendererService", void 0);
    return RichSelectCellEditor;
}(main_1.Component));
exports.RichSelectCellEditor = RichSelectCellEditor;
