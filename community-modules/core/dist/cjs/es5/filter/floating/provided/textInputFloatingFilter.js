/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
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
Object.defineProperty(exports, "__esModule", { value: true });
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var function_1 = require("../../../utils/function");
var providedFilter_1 = require("../../provided/providedFilter");
var context_1 = require("../../../context/context");
var simpleFloatingFilter_1 = require("./simpleFloatingFilter");
var simpleFilter_1 = require("../../provided/simpleFilter");
var keyCode_1 = require("../../../constants/keyCode");
var textFilter_1 = require("../../provided/text/textFilter");
var TextInputFloatingFilter = /** @class */ (function (_super) {
    __extends(TextInputFloatingFilter, _super);
    function TextInputFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextInputFloatingFilter.prototype.postConstruct = function () {
        this.resetTemplate();
    };
    TextInputFloatingFilter.prototype.resetTemplate = function (paramsMap) {
        this.setTemplate(/* html */ "\n            <div class=\"ag-floating-filter-input\" role=\"presentation\">\n                <ag-input-text-field ref=\"eFloatingFilterInput\"></ag-input-text-field>\n            </div>\n        ", paramsMap);
    };
    TextInputFloatingFilter.prototype.getDefaultDebounceMs = function () {
        return 500;
    };
    TextInputFloatingFilter.prototype.onParentModelChanged = function (model, event) {
        if (this.isEventFromFloatingFilter(event)) {
            // if the floating filter triggered the change, it is already in sync
            return;
        }
        this.setLastTypeFromModel(model);
        this.eFloatingFilterInput.setValue(this.getTextFromModel(model));
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
    };
    TextInputFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.params = params;
        this.applyActive = providedFilter_1.ProvidedFilter.isUseApplyButton(this.params.filterParams);
        var allowedCharPattern = this.params.filterParams.allowedCharPattern;
        if (allowedCharPattern != null) {
            this.resetTemplate({ eFloatingFilterInput: { allowedCharPattern: allowedCharPattern } });
        }
        if (!this.isReadOnly()) {
            var debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            var toDebounce = function_1.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
            var filterGui = this.eFloatingFilterInput.getGui();
            this.addManagedListener(filterGui, 'input', toDebounce);
            this.addManagedListener(filterGui, 'keypress', toDebounce);
            this.addManagedListener(filterGui, 'keydown', toDebounce);
        }
        var columnDef = params.column.getDefinition();
        if (this.isReadOnly() || (columnDef.filterParams &&
            columnDef.filterParams.filterOptions &&
            columnDef.filterParams.filterOptions.length === 1 &&
            columnDef.filterParams.filterOptions[0] === 'inRange')) {
            this.eFloatingFilterInput.setDisabled(true);
        }
        var displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eFloatingFilterInput.setInputAriaLabel(displayName + " " + translate('ariaFilterInput', 'Filter Input'));
    };
    TextInputFloatingFilter.prototype.syncUpWithParentFilter = function (e) {
        var _this = this;
        var enterKeyPressed = e.key === keyCode_1.KeyCode.ENTER;
        if (this.applyActive && !enterKeyPressed) {
            return;
        }
        var value = this.eFloatingFilterInput.getValue();
        if (this.params.filterParams.trimInput) {
            value = textFilter_1.TextFilter.trimInput(value);
            this.eFloatingFilterInput.setValue(value, true); // ensure visible value is trimmed
        }
        this.params.parentFilterInstance(function (filterInstance) {
            if (filterInstance) {
                filterInstance.onFloatingFilterChanged(_this.getLastType() || null, value || null);
            }
        });
    };
    TextInputFloatingFilter.prototype.conditionToString = function (condition, options) {
        var numberOfInputs = (options || {}).numberOfInputs;
        var isRange = condition.type == simpleFilter_1.SimpleFilter.IN_RANGE || numberOfInputs === 2;
        if (isRange) {
            return condition.filter + "-" + condition.filterTo;
        }
        // cater for when the type doesn't need a value
        if (condition.filter != null) {
            return "" + condition.filter;
        }
        return "" + condition.type;
    };
    TextInputFloatingFilter.prototype.setEditable = function (editable) {
        this.eFloatingFilterInput.setDisabled(!editable);
    };
    __decorate([
        context_1.Autowired('columnModel')
    ], TextInputFloatingFilter.prototype, "columnModel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFloatingFilterInput')
    ], TextInputFloatingFilter.prototype, "eFloatingFilterInput", void 0);
    __decorate([
        context_1.PostConstruct
    ], TextInputFloatingFilter.prototype, "postConstruct", null);
    return TextInputFloatingFilter;
}(simpleFloatingFilter_1.SimpleFloatingFilter));
exports.TextInputFloatingFilter = TextInputFloatingFilter;
