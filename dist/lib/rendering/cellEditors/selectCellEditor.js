/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var utils_1 = require("../../utils");
var constants_1 = require("../../constants");
var SelectCellEditor = (function (_super) {
    __extends(SelectCellEditor, _super);
    function SelectCellEditor() {
        var _this = _super.call(this, '<div class="ag-cell-edit-input"><select class="ag-cell-edit-input"/></div>') || this;
        _this.eSelect = _this.getGui().querySelector('select');
        return _this;
    }
    SelectCellEditor.prototype.init = function (params) {
        var _this = this;
        this.focusAfterAttached = params.cellStartedEdit;
        if (utils_1.Utils.missing(params.values)) {
            console.log('ag-Grid: no values found for select cellEditor');
            return;
        }
        params.values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.text = value;
            if (params.value === value) {
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
        this.addDestroyableEventListener(this.eSelect, 'change', function () { return params.stopEditing(); });
        this.addDestroyableEventListener(this.eSelect, 'keydown', function (event) {
            var isNavigationKey = event.keyCode === constants_1.Constants.KEY_UP || event.keyCode === constants_1.Constants.KEY_DOWN;
            if (isNavigationKey) {
                event.stopPropagation();
            }
        });
        this.addDestroyableEventListener(this.eSelect, 'mousedown', function (event) {
            event.stopPropagation();
        });
    };
    SelectCellEditor.prototype.afterGuiAttached = function () {
        if (this.focusAfterAttached) {
            this.eSelect.focus();
        }
    };
    SelectCellEditor.prototype.focusIn = function () {
        this.eSelect.focus();
    };
    SelectCellEditor.prototype.getValue = function () {
        return this.eSelect.value;
    };
    return SelectCellEditor;
}(component_1.Component));
exports.SelectCellEditor = SelectCellEditor;
