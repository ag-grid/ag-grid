/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.TextInputFloatingFilter = exports.FloatingFilterTextInputService = void 0;
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var function_1 = require("../../../utils/function");
var providedFilter_1 = require("../../provided/providedFilter");
var context_1 = require("../../../context/context");
var simpleFloatingFilter_1 = require("./simpleFloatingFilter");
var agInputTextField_1 = require("../../../widgets/agInputTextField");
var keyCode_1 = require("../../../constants/keyCode");
var textFilter_1 = require("../../provided/text/textFilter");
var beanStub_1 = require("../../../context/beanStub");
var FloatingFilterTextInputService = /** @class */ (function (_super) {
    __extends(FloatingFilterTextInputService, _super);
    function FloatingFilterTextInputService(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        return _this;
    }
    FloatingFilterTextInputService.prototype.setupGui = function (parentElement) {
        this.eFloatingFilterTextInput = this.createManagedBean(new agInputTextField_1.AgInputTextField(this.params.config));
        this.eFloatingFilterTextInput.setInputAriaLabel(this.params.ariaLabel);
        parentElement.appendChild(this.eFloatingFilterTextInput.getGui());
    };
    FloatingFilterTextInputService.prototype.setEditable = function (editable) {
        this.eFloatingFilterTextInput.setDisabled(!editable);
    };
    FloatingFilterTextInputService.prototype.getValue = function () {
        return this.eFloatingFilterTextInput.getValue();
    };
    FloatingFilterTextInputService.prototype.setValue = function (value, silent) {
        this.eFloatingFilterTextInput.setValue(value, silent);
    };
    FloatingFilterTextInputService.prototype.addValueChangedListener = function (listener) {
        var inputGui = this.eFloatingFilterTextInput.getGui();
        this.addManagedListener(inputGui, 'input', listener);
        this.addManagedListener(inputGui, 'keypress', listener);
        this.addManagedListener(inputGui, 'keydown', listener);
    };
    return FloatingFilterTextInputService;
}(beanStub_1.BeanStub));
exports.FloatingFilterTextInputService = FloatingFilterTextInputService;
var TextInputFloatingFilter = /** @class */ (function (_super) {
    __extends(TextInputFloatingFilter, _super);
    function TextInputFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextInputFloatingFilter.prototype.postConstruct = function () {
        this.setTemplate(/* html */ "\n            <div class=\"ag-floating-filter-input\" role=\"presentation\" ref=\"eFloatingFilterInputContainer\"></div>\n        ");
    };
    TextInputFloatingFilter.prototype.getDefaultDebounceMs = function () {
        return 500;
    };
    TextInputFloatingFilter.prototype.onParentModelChanged = function (model, event) {
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            // if the floating filter triggered the change, it is already in sync.
            // Data changes also do not affect provided text floating filters
            return;
        }
        this.setLastTypeFromModel(model);
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
        this.floatingFilterInputService.setValue(this.getFilterModelFormatter().getModelAsString(model));
    };
    TextInputFloatingFilter.prototype.init = function (params) {
        this.params = params;
        var displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        var translate = this.localeService.getLocaleTextFunc();
        var ariaLabel = displayName + " " + translate('ariaFilterInput', 'Filter Input');
        this.floatingFilterInputService = this.createFloatingFilterInputService(ariaLabel);
        this.floatingFilterInputService.setupGui(this.eFloatingFilterInputContainer);
        _super.prototype.init.call(this, params);
        this.applyActive = providedFilter_1.ProvidedFilter.isUseApplyButton(this.params.filterParams);
        if (!this.isReadOnly()) {
            var debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            var toDebounce = function_1.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
            this.floatingFilterInputService.addValueChangedListener(toDebounce);
        }
    };
    TextInputFloatingFilter.prototype.syncUpWithParentFilter = function (e) {
        var _this = this;
        var enterKeyPressed = e.key === keyCode_1.KeyCode.ENTER;
        if (this.applyActive && !enterKeyPressed) {
            return;
        }
        var value = this.floatingFilterInputService.getValue();
        if (this.params.filterParams.trimInput) {
            value = textFilter_1.TextFilter.trimInput(value);
            this.floatingFilterInputService.setValue(value, true); // ensure visible value is trimmed
        }
        this.params.parentFilterInstance(function (filterInstance) {
            if (filterInstance) {
                // NumberFilter is typed as number, but actually receives string values
                filterInstance.onFloatingFilterChanged(_this.getLastType() || null, value || null);
            }
        });
    };
    TextInputFloatingFilter.prototype.setEditable = function (editable) {
        this.floatingFilterInputService.setEditable(editable);
    };
    __decorate([
        context_1.Autowired('columnModel')
    ], TextInputFloatingFilter.prototype, "columnModel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFloatingFilterInputContainer')
    ], TextInputFloatingFilter.prototype, "eFloatingFilterInputContainer", void 0);
    __decorate([
        context_1.PostConstruct
    ], TextInputFloatingFilter.prototype, "postConstruct", null);
    return TextInputFloatingFilter;
}(simpleFloatingFilter_1.SimpleFloatingFilter));
exports.TextInputFloatingFilter = TextInputFloatingFilter;
