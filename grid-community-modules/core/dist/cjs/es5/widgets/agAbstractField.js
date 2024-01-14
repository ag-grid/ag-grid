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
exports.AgAbstractField = void 0;
var agAbstractLabel_1 = require("./agAbstractLabel");
var dom_1 = require("../utils/dom");
var eventKeys_1 = require("../eventKeys");
var aria_1 = require("../utils/aria");
var AgAbstractField = /** @class */ (function (_super) {
    __extends(AgAbstractField, _super);
    function AgAbstractField(config, template, className) {
        var _this = _super.call(this, config, template) || this;
        _this.className = className;
        return _this;
    }
    AgAbstractField.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        if (this.className) {
            this.addCssClass(this.className);
        }
        this.refreshAriaLabelledBy();
    };
    AgAbstractField.prototype.refreshAriaLabelledBy = function () {
        var ariaEl = this.getAriaElement();
        var labelId = this.getLabelId();
        if ((0, aria_1.getAriaLabel)(ariaEl) !== null) {
            (0, aria_1.setAriaLabelledBy)(ariaEl, '');
        }
        else {
            (0, aria_1.setAriaLabelledBy)(ariaEl, labelId !== null && labelId !== void 0 ? labelId : '');
        }
    };
    AgAbstractField.prototype.setAriaLabel = function (label) {
        (0, aria_1.setAriaLabel)(this.getAriaElement(), label);
        this.refreshAriaLabelledBy();
        return this;
    };
    AgAbstractField.prototype.onValueChange = function (callbackFn) {
        var _this = this;
        this.addManagedListener(this, eventKeys_1.Events.EVENT_FIELD_VALUE_CHANGED, function () { return callbackFn(_this.getValue()); });
        return this;
    };
    AgAbstractField.prototype.getWidth = function () {
        return this.getGui().clientWidth;
    };
    AgAbstractField.prototype.setWidth = function (width) {
        (0, dom_1.setFixedWidth)(this.getGui(), width);
        return this;
    };
    AgAbstractField.prototype.getPreviousValue = function () {
        return this.previousValue;
    };
    AgAbstractField.prototype.getValue = function () {
        return this.value;
    };
    AgAbstractField.prototype.setValue = function (value, silent) {
        if (this.value === value) {
            return this;
        }
        this.previousValue = this.value;
        this.value = value;
        if (!silent) {
            this.dispatchEvent({ type: eventKeys_1.Events.EVENT_FIELD_VALUE_CHANGED });
        }
        return this;
    };
    return AgAbstractField;
}(agAbstractLabel_1.AgAbstractLabel));
exports.AgAbstractField = AgAbstractField;
