/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgAbstractField } from "./agAbstractField";
import { RefSelector } from "./componentAnnotations";
import { setAriaLabelledBy, setAriaLabel, setAriaDescribedBy } from "../utils/aria";
import { createIconNoSpan } from "../utils/icon";
import { exists } from "../utils/generic";
import { setElementWidth, isVisible } from "../utils/dom";
import { KeyCode } from '../constants/keyCode';
var AgPickerField = /** @class */ (function (_super) {
    __extends(AgPickerField, _super);
    function AgPickerField(config, className, pickerIcon, popupRole) {
        var _this = _super.call(this, config, 
        /* html */ "<div class=\"ag-picker-field\" role=\"presentation\">\n                <div ref=\"eLabel\"></div>\n                <div ref=\"eWrapper\"\n                    class=\"ag-wrapper ag-picker-field-wrapper\"\n                    tabIndex=\"-1\"\n                    " + (popupRole ? "aria-haspopup=\"" + popupRole + "\"" : '') + "\n                >\n                    <div ref=\"eDisplayField\" class=\"ag-picker-field-display\"></div>\n                    <div ref=\"eIcon\" class=\"ag-picker-field-icon\" aria-hidden=\"true\"></div>\n                </div>\n            </div>", className) || this;
        _this.pickerIcon = pickerIcon;
        _this.isPickerDisplayed = false;
        _this.isDestroyingPicker = false;
        _this.skipClick = false;
        return _this;
    }
    AgPickerField.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        var displayId = this.getCompId() + "-display";
        this.eDisplayField.setAttribute('id', displayId);
        setAriaDescribedBy(this.eWrapper, displayId);
        var clickHandler = function () {
            if (_this.skipClick) {
                _this.skipClick = false;
                return;
            }
            if (_this.isDisabled()) {
                return;
            }
            _this.pickerComponent = _this.showPicker();
        };
        var eGui = this.getGui();
        this.addManagedListener(eGui, 'mousedown', function (e) {
            if (!_this.skipClick &&
                _this.pickerComponent &&
                _this.pickerComponent.isAlive() &&
                isVisible(_this.pickerComponent.getGui()) &&
                eGui.contains(e.target)) {
                _this.skipClick = true;
            }
        });
        this.addManagedListener(eGui, 'keydown', function (e) {
            switch (e.keyCode) {
                case KeyCode.UP:
                case KeyCode.DOWN:
                case KeyCode.ENTER:
                case KeyCode.SPACE:
                    clickHandler();
                case KeyCode.ESCAPE:
                    if (_this.isPickerDisplayed) {
                        e.preventDefault();
                    }
                    break;
            }
        });
        this.addManagedListener(this.eWrapper, 'click', clickHandler);
        this.addManagedListener(this.eLabel, 'click', clickHandler);
        if (this.pickerIcon) {
            var icon = createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    };
    AgPickerField.prototype.refreshLabel = function () {
        if (exists(this.getLabel())) {
            setAriaLabelledBy(this.eWrapper, this.getLabelId());
        }
        else {
            this.eWrapper.removeAttribute('aria-labelledby');
        }
        _super.prototype.refreshLabel.call(this);
    };
    AgPickerField.prototype.setAriaLabel = function (label) {
        setAriaLabel(this.eWrapper, label);
        return this;
    };
    AgPickerField.prototype.setInputWidth = function (width) {
        setElementWidth(this.eWrapper, width);
        return this;
    };
    AgPickerField.prototype.getFocusableElement = function () {
        return this.eWrapper;
    };
    __decorate([
        RefSelector('eLabel')
    ], AgPickerField.prototype, "eLabel", void 0);
    __decorate([
        RefSelector('eWrapper')
    ], AgPickerField.prototype, "eWrapper", void 0);
    __decorate([
        RefSelector('eDisplayField')
    ], AgPickerField.prototype, "eDisplayField", void 0);
    __decorate([
        RefSelector('eIcon')
    ], AgPickerField.prototype, "eIcon", void 0);
    return AgPickerField;
}(AgAbstractField));
export { AgPickerField };
