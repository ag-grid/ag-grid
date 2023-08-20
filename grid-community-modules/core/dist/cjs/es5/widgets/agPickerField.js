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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgPickerField = void 0;
var agAbstractField_1 = require("./agAbstractField");
var componentAnnotations_1 = require("./componentAnnotations");
var aria_1 = require("../utils/aria");
var icon_1 = require("../utils/icon");
var generic_1 = require("../utils/generic");
var dom_1 = require("../utils/dom");
var keyCode_1 = require("../constants/keyCode");
var context_1 = require("../context/context");
var AgPickerField = /** @class */ (function (_super) {
    __extends(AgPickerField, _super);
    function AgPickerField(config, className, pickerIcon, ariaRole) {
        var _this = _super.call(this, config, 
        /* html */ "<div class=\"ag-picker-field\" role=\"presentation\">\n                <div ref=\"eLabel\"></div>\n                <div ref=\"eWrapper\"\n                    class=\"ag-wrapper ag-picker-field-wrapper ag-picker-collapsed\"\n                    tabIndex=\"-1\"\n                    aria-expanded=\"false\"\n                    " + (ariaRole ? "role=\"" + ariaRole + "\"" : '') + "\n                >\n                    <div ref=\"eDisplayField\" class=\"ag-picker-field-display\"></div>\n                    <div ref=\"eIcon\" class=\"ag-picker-field-icon\" aria-hidden=\"true\"></div>\n                </div>\n            </div>", className) || this;
        _this.pickerIcon = pickerIcon;
        _this.isPickerDisplayed = false;
        _this.skipClick = false;
        _this.pickerGap = 4;
        _this.hideCurrentPicker = null;
        _this.onPickerFocusIn = _this.onPickerFocusIn.bind(_this);
        _this.onPickerFocusOut = _this.onPickerFocusOut.bind(_this);
        if ((config === null || config === void 0 ? void 0 : config.pickerGap) != null) {
            _this.pickerGap = config.pickerGap;
        }
        return _this;
    }
    AgPickerField.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        var displayId = "ag-" + this.getCompId() + "-display";
        this.eDisplayField.setAttribute('id', displayId);
        aria_1.setAriaDescribedBy(this.eWrapper, displayId);
        var eGui = this.getGui();
        this.addManagedListener(eGui, 'mousedown', function (e) {
            var _a;
            if (!_this.skipClick &&
                ((_a = _this.pickerComponent) === null || _a === void 0 ? void 0 : _a.isAlive()) &&
                dom_1.isVisible(_this.pickerComponent.getGui()) &&
                eGui.contains(e.target)) {
                _this.skipClick = true;
            }
        });
        var focusEl = this.getFocusableElement();
        this.addManagedListener(eGui, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.clickHandler.bind(this));
        this.addManagedListener(focusEl, 'click', this.clickHandler.bind(this));
        if (this.pickerIcon) {
            var icon = icon_1.createIconNoSpan(this.pickerIcon, this.gridOptionsService);
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
    AgPickerField.prototype.clickHandler = function () {
        if (this.skipClick) {
            this.skipClick = false;
            return;
        }
        if (this.isDisabled()) {
            return;
        }
        this.showPicker();
    };
    AgPickerField.prototype.onKeyDown = function (e) {
        switch (e.key) {
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.DOWN:
            case keyCode_1.KeyCode.ENTER:
            case keyCode_1.KeyCode.SPACE:
                e.preventDefault();
                this.clickHandler();
                break;
            case keyCode_1.KeyCode.ESCAPE:
                if (this.isPickerDisplayed) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.hideCurrentPicker) {
                        this.hideCurrentPicker();
                    }
                }
                break;
        }
    };
    AgPickerField.prototype.showPicker = function () {
        this.isPickerDisplayed = true;
        if (!this.pickerComponent) {
            this.pickerComponent = this.createPickerComponent();
        }
        var pickerGui = this.pickerComponent.getGui();
        pickerGui.addEventListener('focusin', this.onPickerFocusIn);
        pickerGui.addEventListener('focusout', this.onPickerFocusOut);
        this.hideCurrentPicker = this.renderAndPositionPicker();
        this.toggleExpandedStyles(true);
    };
    AgPickerField.prototype.renderAndPositionPicker = function () {
        var _this = this;
        var eDocument = this.gridOptionsService.getDocument();
        var ePicker = this.pickerComponent.getGui();
        if (!this.gridOptionsService.is('suppressScrollWhenPopupsAreOpen')) {
            this.destroyMouseWheelFunc = this.addManagedListener(eDocument.body, 'wheel', function (e) {
                if (!ePicker.contains(e.target)) {
                    _this.hidePicker();
                }
            });
        }
        var translate = this.localeService.getLocaleTextFunc();
        var _a = this.config, pickerType = _a.pickerType, pickerAriaLabelKey = _a.pickerAriaLabelKey, pickerAriaLabelValue = _a.pickerAriaLabelValue;
        var popupParams = {
            modal: true,
            eChild: ePicker,
            closeOnEsc: true,
            closedCallback: function () {
                var shouldRestoreFocus = eDocument.activeElement === eDocument.body;
                _this.beforeHidePicker();
                if (shouldRestoreFocus && _this.isAlive()) {
                    _this.getFocusableElement().focus();
                }
            },
            ariaLabel: translate(pickerAriaLabelKey, pickerAriaLabelValue),
        };
        var addPopupRes = this.popupService.addPopup(popupParams);
        dom_1.setElementWidth(ePicker, dom_1.getAbsoluteWidth(this.eWrapper));
        ePicker.style.position = 'absolute';
        this.popupService.positionPopupByComponent({
            type: pickerType,
            eventSource: this.eWrapper,
            ePopup: ePicker,
            position: 'under',
            keepWithinBounds: true,
            nudgeY: this.pickerGap
        });
        return addPopupRes.hideFunc;
    };
    AgPickerField.prototype.beforeHidePicker = function () {
        if (this.destroyMouseWheelFunc) {
            this.destroyMouseWheelFunc();
            this.destroyMouseWheelFunc = undefined;
        }
        this.toggleExpandedStyles(false);
        var pickerGui = this.pickerComponent.getGui();
        pickerGui.removeEventListener('focusin', this.onPickerFocusIn);
        pickerGui.removeEventListener('focusout', this.onPickerFocusOut);
        this.isPickerDisplayed = false;
        this.pickerComponent = undefined;
        this.hideCurrentPicker = null;
    };
    AgPickerField.prototype.toggleExpandedStyles = function (expanded) {
        if (!this.isAlive()) {
            return;
        }
        aria_1.setAriaExpanded(this.eWrapper, expanded);
        this.eWrapper.classList.toggle('ag-picker-expanded', expanded);
        this.eWrapper.classList.toggle('ag-picker-collapsed', !expanded);
    };
    AgPickerField.prototype.onPickerFocusIn = function () {
        this.togglePickerHasFocus(true);
    };
    AgPickerField.prototype.onPickerFocusOut = function (e) {
        var _a;
        if (!((_a = this.pickerComponent) === null || _a === void 0 ? void 0 : _a.getGui().contains(e.relatedTarget))) {
            this.togglePickerHasFocus(false);
        }
    };
    AgPickerField.prototype.togglePickerHasFocus = function (focused) {
        if (!this.pickerComponent) {
            return;
        }
        this.eWrapper.classList.toggle('ag-picker-has-focus', focused);
    };
    AgPickerField.prototype.hidePicker = function () {
        if (this.hideCurrentPicker) {
            this.hideCurrentPicker();
        }
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
    AgPickerField.prototype.setPickerGap = function (gap) {
        this.pickerGap = gap;
        return this;
    };
    AgPickerField.prototype.destroy = function () {
        this.hidePicker();
        _super.prototype.destroy.call(this);
    };
    __decorate([
        context_1.Autowired('popupService')
    ], AgPickerField.prototype, "popupService", void 0);
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
