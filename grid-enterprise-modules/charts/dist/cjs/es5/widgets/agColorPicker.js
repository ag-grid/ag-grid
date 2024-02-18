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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgColorPicker = void 0;
var agColorPanel_1 = require("./agColorPanel");
var core_1 = require("@ag-grid-community/core");
var AgColorPicker = /** @class */ (function (_super) {
    __extends(AgColorPicker, _super);
    function AgColorPicker(config) {
        var _this = _super.call(this, __assign({ pickerAriaLabelKey: 'ariaLabelColorPicker', pickerAriaLabelValue: 'Color Picker', pickerType: 'ag-list', className: 'ag-color-picker', pickerIcon: 'colorPicker' }, config)) || this;
        if (config && config.color) {
            _this.value = config.color;
        }
        return _this;
    }
    AgColorPicker.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        if (this.value) {
            this.setValue(this.value);
        }
    };
    AgColorPicker.prototype.createPickerComponent = function () {
        var eGuiRect = this.getGui().getBoundingClientRect();
        var colorDialog = this.createBean(new core_1.AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 190,
            width: 190,
            height: 250,
            x: eGuiRect.right - 190,
            y: eGuiRect.top - 250
        }));
        return colorDialog;
    };
    AgColorPicker.prototype.renderAndPositionPicker = function () {
        var _this = this;
        var pickerComponent = this.pickerComponent;
        var colorPanel = this.createBean(new agColorPanel_1.AgColorPanel({ picker: this }));
        pickerComponent.addCssClass('ag-color-dialog');
        colorPanel.addDestroyFunc(function () {
            if (pickerComponent.isAlive()) {
                _this.destroyBean(pickerComponent);
            }
        });
        pickerComponent.setParentComponent(this);
        pickerComponent.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());
        colorPanel.getGui().focus();
        pickerComponent.addDestroyFunc(function () {
            // here we check if the picker was already being
            // destroyed to avoid a stack overflow
            if (!_this.isDestroyingPicker) {
                _this.beforeHidePicker();
                _this.isDestroyingPicker = true;
                if (colorPanel.isAlive()) {
                    _this.destroyBean(colorPanel);
                }
                if (_this.isAlive()) {
                    _this.getFocusableElement().focus();
                }
            }
            else {
                _this.isDestroyingPicker = false;
            }
        });
        return function () { var _a; return (_a = _this.pickerComponent) === null || _a === void 0 ? void 0 : _a.close(); };
    };
    AgColorPicker.prototype.setValue = function (color) {
        if (this.value === color) {
            return this;
        }
        this.eDisplayField.style.backgroundColor = color;
        return _super.prototype.setValue.call(this, color);
    };
    AgColorPicker.prototype.getValue = function () {
        return this.value;
    };
    return AgColorPicker;
}(core_1.AgPickerField));
exports.AgColorPicker = AgColorPicker;
