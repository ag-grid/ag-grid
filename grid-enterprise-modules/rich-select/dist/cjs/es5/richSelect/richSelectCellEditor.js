"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichSelectCellEditor = void 0;
var core_1 = require("@ag-grid-community/core");
var RichSelectCellEditor = /** @class */ (function (_super) {
    __extends(RichSelectCellEditor, _super);
    function RichSelectCellEditor() {
        return _super.call(this, /* html */ "<div class=\"ag-cell-edit-wrapper\"></div>") || this;
    }
    RichSelectCellEditor.prototype.init = function (params) {
        this.params = params;
        var cellStartedEdit = params.cellStartedEdit, values = params.values, cellHeight = params.cellHeight;
        if (core_1._.missing(values)) {
            console.warn('AG Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        var richSelectParams = this.buildRichSelectParams();
        this.richSelect = this.createManagedBean(new core_1.AgRichSelect(richSelectParams));
        this.appendChild(this.richSelect);
        this.addManagedListener(this.richSelect, core_1.Events.EVENT_FIELD_PICKER_VALUE_SELECTED, this.onEditorPickerValueSelected.bind(this));
        this.addManagedListener(this.richSelect.getGui(), 'focusout', this.onEditorFocusOut.bind(this));
        this.focusAfterAttached = cellStartedEdit;
        if (core_1._.exists(cellHeight)) {
            this.richSelect.setRowHeight(cellHeight);
        }
    };
    RichSelectCellEditor.prototype.onEditorPickerValueSelected = function (e) {
        this.params.stopEditing(!e.fromEnterKey);
    };
    RichSelectCellEditor.prototype.onEditorFocusOut = function (e) {
        if (this.richSelect.getGui().contains(e.relatedTarget)) {
            return;
        }
        this.params.stopEditing(true);
    };
    RichSelectCellEditor.prototype.buildRichSelectParams = function () {
        var _this = this;
        var _a = this.params, cellRenderer = _a.cellRenderer, value = _a.value, values = _a.values, colDef = _a.colDef, formatValue = _a.formatValue, searchDebounceDelay = _a.searchDebounceDelay, valueListGap = _a.valueListGap;
        var ret = {
            value: value,
            valueList: values,
            cellRenderer: cellRenderer,
            searchDebounceDelay: searchDebounceDelay,
            valueFormatter: formatValue,
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'virtual-list',
        };
        if (valueListGap != null) {
            ret.pickerGap = valueListGap;
        }
        if (typeof values[0] === 'object' && colDef.keyCreator) {
            ret.searchStringCreator = function (values) { return values.map(function (value) {
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
                return colDef.keyCreator(keyParams);
            }); };
        }
        return ret;
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    RichSelectCellEditor.prototype.afterGuiAttached = function () {
        var _this = this;
        var _a = this, focusAfterAttached = _a.focusAfterAttached, params = _a.params;
        setTimeout(function () {
            if (!_this.isAlive()) {
                return;
            }
            if (focusAfterAttached) {
                _this.richSelect.getFocusableElement().focus();
            }
            _this.richSelect.showPicker();
            var eventKey = params.eventKey;
            if (eventKey) {
                if ((eventKey === null || eventKey === void 0 ? void 0 : eventKey.length) === 1) {
                    _this.richSelect.searchText(eventKey);
                }
            }
        });
    };
    RichSelectCellEditor.prototype.getValue = function () {
        return this.richSelect.getValue();
    };
    RichSelectCellEditor.prototype.isPopup = function () {
        return false;
    };
    return RichSelectCellEditor;
}(core_1.PopupComponent));
exports.RichSelectCellEditor = RichSelectCellEditor;
