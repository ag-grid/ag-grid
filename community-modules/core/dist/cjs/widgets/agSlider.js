/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var componentAnnotations_1 = require("./componentAnnotations");
var agAbstractLabel_1 = require("./agAbstractLabel");
var agAbstractField_1 = require("./agAbstractField");
var context_1 = require("../context/context");
var dom_1 = require("../utils/dom");
var AgSlider = /** @class */ (function (_super) {
    __extends(AgSlider, _super);
    function AgSlider(config) {
        var _this = _super.call(this, config, AgSlider.TEMPLATE) || this;
        _this.labelAlignment = 'top';
        return _this;
    }
    AgSlider.prototype.init = function () {
        dom_1.addCssClass(this.eSlider.getGui(), 'ag-slider-field');
    };
    AgSlider.prototype.onValueChange = function (callbackFn) {
        var _this = this;
        var eventChanged = agAbstractField_1.AgAbstractField.EVENT_CHANGED;
        this.addManagedListener(this.eText, eventChanged, function () {
            var textValue = parseFloat(_this.eText.getValue());
            _this.eSlider.setValue(textValue.toString(), true);
            callbackFn(textValue || 0);
        });
        this.addManagedListener(this.eSlider, eventChanged, function () {
            var sliderValue = _this.eSlider.getValue();
            _this.eText.setValue(sliderValue, true);
            callbackFn(parseFloat(sliderValue));
        });
        return this;
    };
    AgSlider.prototype.setSliderWidth = function (width) {
        this.eSlider.setWidth(width);
        return this;
    };
    AgSlider.prototype.setTextFieldWidth = function (width) {
        this.eText.setWidth(width);
        return this;
    };
    AgSlider.prototype.setMinValue = function (minValue) {
        this.eSlider.setMinValue(minValue);
        this.eText.setMin(minValue);
        return this;
    };
    AgSlider.prototype.setMaxValue = function (maxValue) {
        this.eSlider.setMaxValue(maxValue);
        this.eText.setMax(maxValue);
        return this;
    };
    AgSlider.prototype.getValue = function () {
        return this.eText.getValue();
    };
    AgSlider.prototype.setValue = function (value) {
        if (this.getValue() === value) {
            return this;
        }
        this.eText.setValue(value, true);
        this.eSlider.setValue(value, true);
        this.dispatchEvent({ type: agAbstractField_1.AgAbstractField.EVENT_CHANGED });
        return this;
    };
    AgSlider.prototype.setStep = function (step) {
        this.eSlider.setStep(step);
        this.eText.setStep(step);
        return this;
    };
    AgSlider.TEMPLATE = "<div class=\"ag-slider\">\n            <label ref=\"eLabel\"></label>\n            <div class=\"ag-wrapper ag-slider-wrapper\">\n                <ag-input-range ref=\"eSlider\"></ag-input-range>\n                <ag-input-number-field ref=\"eText\"></ag-input-number-field>\n            </div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('eLabel')
    ], AgSlider.prototype, "eLabel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSlider')
    ], AgSlider.prototype, "eSlider", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eText')
    ], AgSlider.prototype, "eText", void 0);
    __decorate([
        context_1.PostConstruct
    ], AgSlider.prototype, "init", null);
    return AgSlider;
}(agAbstractLabel_1.AgAbstractLabel));
exports.AgSlider = AgSlider;

//# sourceMappingURL=agSlider.js.map
