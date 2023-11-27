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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDateComponent = void 0;
var component_1 = require("../../../widgets/component");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var date_1 = require("../../../utils/date");
var browser_1 = require("../../../utils/browser");
var function_1 = require("../../../utils/function");
var DefaultDateComponent = /** @class */ (function (_super) {
    __extends(DefaultDateComponent, _super);
    function DefaultDateComponent() {
        return _super.call(this, /* html */ "\n            <div class=\"ag-filter-filter\">\n                <ag-input-text-field class=\"ag-date-filter\" ref=\"eDateInput\"></ag-input-text-field>\n            </div>") || this;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    DefaultDateComponent.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    DefaultDateComponent.prototype.init = function (params) {
        var _this = this;
        this.params = params;
        this.setParams(params);
        var eDocument = this.gridOptionsService.getDocument();
        var inputElement = this.eDateInput.getInputElement();
        // ensures that the input element is focussed when a clear button is clicked,
        // unless using safari as there is no clear button and focus does not work properly
        this.addManagedListener(inputElement, 'mousedown', function () {
            if (_this.eDateInput.isDisabled() || _this.usingSafariDatePicker) {
                return;
            }
            inputElement.focus();
        });
        this.addManagedListener(inputElement, 'input', function (e) {
            if (e.target !== eDocument.activeElement) {
                return;
            }
            if (_this.eDateInput.isDisabled()) {
                return;
            }
            _this.params.onDateChanged();
        });
    };
    DefaultDateComponent.prototype.setParams = function (params) {
        var inputElement = this.eDateInput.getInputElement();
        var shouldUseBrowserDatePicker = this.shouldUseBrowserDatePicker(params);
        this.usingSafariDatePicker = shouldUseBrowserDatePicker && (0, browser_1.isBrowserSafari)();
        inputElement.type = shouldUseBrowserDatePicker ? 'date' : 'text';
        var _a = params.filterParams || {}, minValidYear = _a.minValidYear, maxValidYear = _a.maxValidYear, minValidDate = _a.minValidDate, maxValidDate = _a.maxValidDate;
        if (minValidDate && minValidYear) {
            (0, function_1.warnOnce)('DateFilter should not have both minValidDate and minValidYear parameters set at the same time! minValidYear will be ignored.');
        }
        if (maxValidDate && maxValidYear) {
            (0, function_1.warnOnce)('DateFilter should not have both maxValidDate and maxValidYear parameters set at the same time! maxValidYear will be ignored.');
        }
        if (minValidDate && maxValidDate) {
            var _b = __read([minValidDate, maxValidDate]
                .map(function (v) { return v instanceof Date ? v : (0, date_1.parseDateTimeFromString)(v); }), 2), parsedMinValidDate = _b[0], parsedMaxValidDate = _b[1];
            if (parsedMinValidDate && parsedMaxValidDate && parsedMinValidDate.getTime() > parsedMaxValidDate.getTime()) {
                (0, function_1.warnOnce)('DateFilter parameter minValidDate should always be lower than or equal to parameter maxValidDate.');
            }
        }
        if (minValidDate) {
            if (minValidDate instanceof Date) {
                inputElement.min = (0, date_1.dateToFormattedString)(minValidDate);
            }
            else {
                inputElement.min = minValidDate;
            }
        }
        else {
            if (minValidYear) {
                inputElement.min = "".concat(minValidYear, "-01-01");
            }
        }
        if (maxValidDate) {
            if (maxValidDate instanceof Date) {
                inputElement.max = (0, date_1.dateToFormattedString)(maxValidDate);
            }
            else {
                inputElement.max = maxValidDate;
            }
        }
        else {
            if (maxValidYear) {
                inputElement.max = "".concat(maxValidYear, "-12-31");
            }
        }
    };
    DefaultDateComponent.prototype.onParamsUpdated = function (params) {
        this.params = params;
        this.setParams(params);
    };
    DefaultDateComponent.prototype.getDate = function () {
        return (0, date_1.parseDateTimeFromString)(this.eDateInput.getValue());
    };
    DefaultDateComponent.prototype.setDate = function (date) {
        this.eDateInput.setValue((0, date_1.serialiseDate)(date, false));
    };
    DefaultDateComponent.prototype.setInputPlaceholder = function (placeholder) {
        this.eDateInput.setInputPlaceholder(placeholder);
    };
    DefaultDateComponent.prototype.setDisabled = function (disabled) {
        this.eDateInput.setDisabled(disabled);
    };
    DefaultDateComponent.prototype.afterGuiAttached = function (params) {
        if (!params || !params.suppressFocus) {
            this.eDateInput.getInputElement().focus();
        }
    };
    DefaultDateComponent.prototype.shouldUseBrowserDatePicker = function (params) {
        if (params.filterParams && params.filterParams.browserDatePicker != null) {
            return params.filterParams.browserDatePicker;
        }
        return (0, browser_1.isBrowserChrome)() || (0, browser_1.isBrowserFirefox)() || ((0, browser_1.isBrowserSafari)() && (0, browser_1.getSafariVersion)() >= 14.1);
    };
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eDateInput')
    ], DefaultDateComponent.prototype, "eDateInput", void 0);
    return DefaultDateComponent;
}(component_1.Component));
exports.DefaultDateComponent = DefaultDateComponent;
