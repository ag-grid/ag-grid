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
Object.defineProperty(exports, "__esModule", { value: true });
var agColorPanel_1 = require("./agColorPanel");
var agDialog_1 = require("./agDialog");
var agPickerField_1 = require("./agPickerField");
var dom_1 = require("../utils/dom");
var AgColorPicker = /** @class */ (function (_super) {
    __extends(AgColorPicker, _super);
    function AgColorPicker(config) {
        var _this = _super.call(this, config, 'ag-color-picker', 'colorPicker') || this;
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
    AgColorPicker.prototype.showPicker = function () {
        var _this = this;
        var eGuiRect = this.getGui().getBoundingClientRect();
        var colorDialog = this.createBean(new agDialog_1.AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 190,
            width: 190,
            height: 250,
            x: eGuiRect.right - 190,
            y: eGuiRect.top - 250
        }));
        this.isPickerDisplayed = true;
        dom_1.addCssClass(colorDialog.getGui(), 'ag-color-dialog');
        var colorPanel = this.createBean(new agColorPanel_1.AgColorPanel({ picker: this }));
        colorPanel.addDestroyFunc(function () {
            if (colorDialog.isAlive()) {
                _this.destroyBean(colorDialog);
            }
        });
        colorDialog.setParentComponent(this);
        colorDialog.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());
        colorDialog.addDestroyFunc(function () {
            // here we check if the picker was already being
            // destroyed to avoid a stack overflow
            if (!_this.isDestroyingPicker) {
                _this.isDestroyingPicker = true;
                if (colorPanel.isAlive()) {
                    _this.destroyBean(colorPanel);
                }
            }
            else {
                _this.isDestroyingPicker = false;
            }
            if (_this.isAlive()) {
                _this.getFocusableElement().focus();
            }
            _this.isPickerDisplayed = false;
        });
        return colorDialog;
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
}(agPickerField_1.AgPickerField));
exports.AgColorPicker = AgColorPicker;

//# sourceMappingURL=agColorPicker.js.map
