/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
exports.DefaultDateComponent = void 0;
var component_1 = require("../../../widgets/component");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var date_1 = require("../../../utils/date");
var browser_1 = require("../../../utils/browser");
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
        var eDocument = this.gridOptionsService.getDocument();
        var inputElement = this.eDateInput.getInputElement();
        var shouldUseBrowserDatePicker = this.shouldUseBrowserDatePicker(params);
        if (shouldUseBrowserDatePicker) {
            inputElement.type = 'date';
        }
        // ensures that the input element is focussed when a clear button is clicked,
        // unless using safari as there is no clear button and focus does not work properly
        var usingSafariDatePicker = shouldUseBrowserDatePicker && browser_1.isBrowserSafari();
        this.addManagedListener(inputElement, 'mousedown', function () {
            if (_this.eDateInput.isDisabled() || usingSafariDatePicker) {
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
            params.onDateChanged();
        });
        var _a = params.filterParams || {}, minValidYear = _a.minValidYear, maxValidYear = _a.maxValidYear;
        if (minValidYear) {
            inputElement.min = minValidYear + "-01-01";
        }
        if (maxValidYear) {
            inputElement.max = maxValidYear + "-12-31";
        }
    };
    DefaultDateComponent.prototype.getDate = function () {
        return date_1.parseDateTimeFromString(this.eDateInput.getValue());
    };
    DefaultDateComponent.prototype.setDate = function (date) {
        this.eDateInput.setValue(date_1.serialiseDate(date, false));
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
        return browser_1.isBrowserChrome() || browser_1.isBrowserFirefox() || (browser_1.isBrowserSafari() && browser_1.getSafariVersion() >= 14.1);
    };
    __decorate([
        componentAnnotations_1.RefSelector('eDateInput')
    ], DefaultDateComponent.prototype, "eDateInput", void 0);
    return DefaultDateComponent;
}(component_1.Component));
exports.DefaultDateComponent = DefaultDateComponent;
