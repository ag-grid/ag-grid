/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var popupComponent_1 = require("../../widgets/popupComponent");
var constants_1 = require("../../constants");
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var valueFormatterService_1 = require("../valueFormatterService");
var utils_1 = require("../../utils");
var SelectCellEditor = /** @class */ (function (_super) {
    __extends(SelectCellEditor, _super);
    function SelectCellEditor() {
        var _this = _super.call(this, '<div class="ag-cell-edit-input"><select class="ag-cell-edit-input"/></div>') || this;
        _this.eSelect = _this.getGui().querySelector('select');
        return _this;
    }
    SelectCellEditor.prototype.init = function (params) {
        var _this = this;
        this.focusAfterAttached = params.cellStartedEdit;
        if (utils_1._.missing(params.values)) {
            console.warn('ag-Grid: no values found for select cellEditor');
            return;
        }
        params.values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            var valueFormatted = _this.valueFormatterService.formatValue(params.column, null, null, value);
            var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;
            if (params.value === value) {
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            this.addDestroyableEventListener(this.eSelect, 'change', function () { return params.stopEditing(); });
        }
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
    SelectCellEditor.prototype.isPopup = function () {
        return false;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], SelectCellEditor.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService'),
        __metadata("design:type", valueFormatterService_1.ValueFormatterService)
    ], SelectCellEditor.prototype, "valueFormatterService", void 0);
    return SelectCellEditor;
}(popupComponent_1.PopupComponent));
exports.SelectCellEditor = SelectCellEditor;
