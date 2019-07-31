/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var agAbstractField_1 = require("./agAbstractField");
var utils_1 = require("../utils");
var AgColorPicker = /** @class */ (function (_super) {
    __extends(AgColorPicker, _super);
    function AgColorPicker(config) {
        var _this = _super.call(this) || this;
        _this.displayTag = 'div';
        _this.className = 'ag-color-picker';
        _this.pickerIcon = 'colorPicker';
        _this.setTemplate(_this.TEMPLATE.replace(/%displayField%/g, _this.displayTag));
        if (config && config.color) {
            _this.value = config.color;
        }
        return _this;
    }
    AgColorPicker.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        utils_1._.addCssClass(this.getGui(), this.className);
        this.addDestroyableEventListener(this.eDisplayField, 'click', function () { return _this.showPicker(); });
        if (this.value) {
            this.setValue(this.value);
        }
    };
    AgColorPicker.prototype.showPicker = function () {
        var _this = this;
        if (this.displayedPicker) {
            this.displayedPicker = false;
            return;
        }
        var eGuiRect = this.getGui().getBoundingClientRect();
        var colorDialog = new agDialog_1.AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 190,
            width: 190,
            height: 250,
            x: eGuiRect.right - 190,
            y: eGuiRect.top - 250
        });
        this.getContext().wireBean(colorDialog);
        utils_1._.addCssClass(colorDialog.getGui(), 'ag-color-dialog');
        var colorPanel = new agColorPanel_1.AgColorPanel({
            picker: this
        });
        this.getContext().wireBean(colorPanel);
        colorPanel.addDestroyFunc(function () {
            if (colorDialog.isAlive()) {
                colorDialog.destroy();
            }
        });
        colorDialog.setParentComponent(this);
        colorDialog.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());
        colorDialog.addDestroyFunc(function () {
            var wasDestroying = _this.isDestroyingPicker;
            _this.displayedPicker = false;
            // here we check if the picker was already being
            // destroyed to avoid a stackoverflow
            if (!wasDestroying) {
                _this.isDestroyingPicker = true;
                if (colorPanel.isAlive()) {
                    colorPanel.destroy();
                }
            }
            else {
                _this.isDestroyingPicker = false;
            }
        });
    };
    AgColorPicker.prototype.setValue = function (color) {
        this.value = color;
        this.eDisplayField.style.backgroundColor = color;
        this.dispatchEvent({ type: agAbstractField_1.AgAbstractField.EVENT_CHANGED });
        return this;
    };
    AgColorPicker.prototype.getValue = function () {
        return this.value;
    };
    return AgColorPicker;
}(agPickerField_1.AgPickerField));
exports.AgColorPicker = AgColorPicker;
