/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { AgColorPanel } from "./agColorPanel";
import { AgDialog } from "./agDialog";
import { AgPickerField } from "./agPickerField";
import { AgAbstractField } from "./agAbstractField";
import { _ } from "../utils";
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
        _super.prototype.postConstruct.call(this);
        if (this.value) {
            this.setValue(this.value);
        }
    };
    AgColorPicker.prototype.showPicker = function () {
        var _this = this;
        var eGuiRect = this.getGui().getBoundingClientRect();
        var colorDialog = new AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 190,
            width: 190,
            height: 250,
            x: eGuiRect.right - 190,
            y: eGuiRect.top - 250
        });
        this.createBean(colorDialog);
        _.addCssClass(colorDialog.getGui(), 'ag-color-dialog');
        var colorPanel = new AgColorPanel({
            picker: this
        });
        this.createBean(colorPanel);
        colorPanel.addDestroyFunc(function () {
            if (colorDialog.isAlive()) {
                _this.destroyBean(colorDialog);
            }
        });
        colorDialog.setParentComponent(this);
        colorDialog.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());
        colorDialog.addDestroyFunc(function () {
            var wasDestroying = _this.isDestroyingPicker;
            // here we check if the picker was already being
            // destroyed to avoid a stackoverflow
            if (!wasDestroying) {
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
        });
        return colorDialog;
    };
    AgColorPicker.prototype.setValue = function (color) {
        if (this.value === color) {
            return this;
        }
        this.value = color;
        this.eDisplayField.style.backgroundColor = color;
        this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        return this;
    };
    AgColorPicker.prototype.getValue = function () {
        return this.value;
    };
    return AgColorPicker;
}(AgPickerField));
export { AgColorPicker };
