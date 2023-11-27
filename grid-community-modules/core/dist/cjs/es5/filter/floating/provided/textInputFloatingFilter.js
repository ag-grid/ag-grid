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
var dom_1 = require("../../../utils/dom");
var FloatingFilterTextInputService = /** @class */ (function (_super) {
    __extends(FloatingFilterTextInputService, _super);
    function FloatingFilterTextInputService(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.valueChangedListener = function () { };
        return _this;
    }
    FloatingFilterTextInputService.prototype.setupGui = function (parentElement) {
        var _this = this;
        var _a;
        this.eFloatingFilterTextInput = this.createManagedBean(new agInputTextField_1.AgInputTextField((_a = this.params) === null || _a === void 0 ? void 0 : _a.config));
        var eInput = this.eFloatingFilterTextInput.getGui();
        parentElement.appendChild(eInput);
        this.addManagedListener(eInput, 'input', function (e) { return _this.valueChangedListener(e); });
        this.addManagedListener(eInput, 'keydown', function (e) { return _this.valueChangedListener(e); });
    };
    FloatingFilterTextInputService.prototype.setEditable = function (editable) {
        this.eFloatingFilterTextInput.setDisabled(!editable);
    };
    FloatingFilterTextInputService.prototype.setAutoComplete = function (autoComplete) {
        this.eFloatingFilterTextInput.setAutoComplete(autoComplete);
    };
    FloatingFilterTextInputService.prototype.getValue = function () {
        return this.eFloatingFilterTextInput.getValue();
    };
    FloatingFilterTextInputService.prototype.setValue = function (value, silent) {
        this.eFloatingFilterTextInput.setValue(value, silent);
    };
    FloatingFilterTextInputService.prototype.setValueChangedListener = function (listener) {
        this.valueChangedListener = listener;
    };
    FloatingFilterTextInputService.prototype.setParams = function (params) {
        this.setAriaLabel(params.ariaLabel);
        if (params.autoComplete !== undefined) {
            this.setAutoComplete(params.autoComplete);
        }
    };
    FloatingFilterTextInputService.prototype.setAriaLabel = function (ariaLabel) {
        this.eFloatingFilterTextInput.setInputAriaLabel(ariaLabel);
    };
    return FloatingFilterTextInputService;
}(beanStub_1.BeanStub));
exports.FloatingFilterTextInputService = FloatingFilterTextInputService;
;
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
        this.setupFloatingFilterInputService(params);
        _super.prototype.init.call(this, params);
        this.setTextInputParams(params);
    };
    TextInputFloatingFilter.prototype.setupFloatingFilterInputService = function (params) {
        this.floatingFilterInputService = this.createFloatingFilterInputService(params);
        this.floatingFilterInputService.setupGui(this.eFloatingFilterInputContainer);
    };
    TextInputFloatingFilter.prototype.setTextInputParams = function (params) {
        var _a;
        this.params = params;
        var autoComplete = (_a = params.browserAutoComplete) !== null && _a !== void 0 ? _a : false;
        this.floatingFilterInputService.setParams({
            ariaLabel: this.getAriaLabel(params),
            autoComplete: autoComplete,
        });
        this.applyActive = providedFilter_1.ProvidedFilter.isUseApplyButton(this.params.filterParams);
        if (!this.isReadOnly()) {
            var debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            var toDebounce = (0, function_1.debounce)(this.syncUpWithParentFilter.bind(this), debounceMs);
            this.floatingFilterInputService.setValueChangedListener(toDebounce);
        }
    };
    TextInputFloatingFilter.prototype.onParamsUpdated = function (params) {
        _super.prototype.onParamsUpdated.call(this, params);
        this.setTextInputParams(params);
    };
    TextInputFloatingFilter.prototype.recreateFloatingFilterInputService = function (params) {
        var value = this.floatingFilterInputService.getValue();
        (0, dom_1.clearElement)(this.eFloatingFilterInputContainer);
        this.destroyBean(this.floatingFilterInputService);
        this.setupFloatingFilterInputService(params);
        this.floatingFilterInputService.setValue(value, true);
    };
    TextInputFloatingFilter.prototype.getAriaLabel = function (params) {
        var displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        var translate = this.localeService.getLocaleTextFunc();
        return "".concat(displayName, " ").concat(translate('ariaFilterInput', 'Filter Input'));
    };
    TextInputFloatingFilter.prototype.syncUpWithParentFilter = function (e) {
        var _this = this;
        var isEnterKey = e.key === keyCode_1.KeyCode.ENTER;
        if (this.applyActive && !isEnterKey) {
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
        (0, context_1.Autowired)('columnModel')
    ], TextInputFloatingFilter.prototype, "columnModel", void 0);
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eFloatingFilterInputContainer')
    ], TextInputFloatingFilter.prototype, "eFloatingFilterInputContainer", void 0);
    __decorate([
        context_1.PostConstruct
    ], TextInputFloatingFilter.prototype, "postConstruct", null);
    return TextInputFloatingFilter;
}(simpleFloatingFilter_1.SimpleFloatingFilter));
exports.TextInputFloatingFilter = TextInputFloatingFilter;
