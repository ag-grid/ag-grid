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
var agAbstractField_1 = require("./agAbstractField");
var componentAnnotations_1 = require("./componentAnnotations");
var aria_1 = require("../utils/aria");
var icon_1 = require("../utils/icon");
var generic_1 = require("../utils/generic");
var dom_1 = require("../utils/dom");
var keyCode_1 = require("../constants/keyCode");
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
        aria_1.setAriaDescribedBy(this.eWrapper, displayId);
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
                dom_1.isVisible(_this.pickerComponent.getGui()) &&
                eGui.contains(e.target)) {
                _this.skipClick = true;
            }
        });
        this.addManagedListener(eGui, 'keydown', function (e) {
            switch (e.keyCode) {
                case keyCode_1.KeyCode.UP:
                case keyCode_1.KeyCode.DOWN:
                case keyCode_1.KeyCode.ENTER:
                case keyCode_1.KeyCode.SPACE:
                    clickHandler();
                case keyCode_1.KeyCode.ESCAPE:
                    if (_this.isPickerDisplayed) {
                        e.preventDefault();
                    }
                    break;
            }
        });
        this.addManagedListener(this.eWrapper, 'click', clickHandler);
        this.addManagedListener(this.eLabel, 'click', clickHandler);
        if (this.pickerIcon) {
            var icon = icon_1.createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    };
    AgPickerField.prototype.refreshLabel = function () {
        if (generic_1.exists(this.getLabel())) {
            aria_1.setAriaLabelledBy(this.eWrapper, this.getLabelId());
        }
        else {
            this.eWrapper.removeAttribute('aria-labelledby');
        }
        _super.prototype.refreshLabel.call(this);
    };
    AgPickerField.prototype.setAriaLabel = function (label) {
        aria_1.setAriaLabel(this.eWrapper, label);
        return this;
    };
    AgPickerField.prototype.setInputWidth = function (width) {
        dom_1.setElementWidth(this.eWrapper, width);
        return this;
    };
    AgPickerField.prototype.getFocusableElement = function () {
        return this.eWrapper;
    };
    __decorate([
        componentAnnotations_1.RefSelector('eLabel')
    ], AgPickerField.prototype, "eLabel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eWrapper')
    ], AgPickerField.prototype, "eWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eDisplayField')
    ], AgPickerField.prototype, "eDisplayField", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eIcon')
    ], AgPickerField.prototype, "eIcon", void 0);
    return AgPickerField;
}(agAbstractField_1.AgAbstractField));
exports.AgPickerField = AgPickerField;

//# sourceMappingURL=agPickerField.js.map
