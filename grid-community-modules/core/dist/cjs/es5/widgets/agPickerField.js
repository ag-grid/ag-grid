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
var dom_1 = require("../utils/dom");
var keyCode_1 = require("../constants/keyCode");
var context_1 = require("../context/context");
var eventKeys_1 = require("../eventKeys");
var TEMPLATE = /* html */ "\n    <div class=\"ag-picker-field\" role=\"presentation\">\n        <div ref=\"eLabel\"></div>\n            <div ref=\"eWrapper\" class=\"ag-wrapper ag-picker-field-wrapper ag-picker-collapsed\">\n            <div ref=\"eDisplayField\" class=\"ag-picker-field-display\"></div>\n            <div ref=\"eIcon\" class=\"ag-picker-field-icon\" aria-hidden=\"true\"></div>\n        </div>\n    </div>";
var AgPickerField = /** @class */ (function (_super) {
    __extends(AgPickerField, _super);
    function AgPickerField(config) {
        var _this = _super.call(this, config, (config === null || config === void 0 ? void 0 : config.template) || TEMPLATE, config === null || config === void 0 ? void 0 : config.className) || this;
        _this.isPickerDisplayed = false;
        _this.skipClick = false;
        _this.pickerGap = 4;
        _this.hideCurrentPicker = null;
        _this.ariaRole = config === null || config === void 0 ? void 0 : config.ariaRole;
        _this.onPickerFocusIn = _this.onPickerFocusIn.bind(_this);
        _this.onPickerFocusOut = _this.onPickerFocusOut.bind(_this);
        if (!config) {
            return _this;
        }
        var pickerGap = config.pickerGap, maxPickerHeight = config.maxPickerHeight, variableWidth = config.variableWidth, minPickerWidth = config.minPickerWidth, maxPickerWidth = config.maxPickerWidth;
        if (pickerGap != null) {
            _this.pickerGap = pickerGap;
        }
        _this.variableWidth = !!variableWidth;
        if (maxPickerHeight != null) {
            _this.setPickerMaxHeight(maxPickerHeight);
        }
        if (minPickerWidth != null) {
            _this.setPickerMinWidth(minPickerWidth);
        }
        if (maxPickerWidth != null) {
            _this.setPickerMaxWidth(maxPickerWidth);
        }
        return _this;
    }
    AgPickerField.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        this.setupAria();
        var displayId = "ag-".concat(this.getCompId(), "-display");
        this.eDisplayField.setAttribute('id', displayId);
        var ariaEl = this.getAriaElement();
        this.addManagedListener(ariaEl, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(this.eLabel, 'mousedown', this.onLabelOrWrapperMouseDown.bind(this));
        this.addManagedListener(this.eWrapper, 'mousedown', this.onLabelOrWrapperMouseDown.bind(this));
        var pickerIcon = this.config.pickerIcon;
        if (pickerIcon) {
            var icon = (0, icon_1.createIconNoSpan)(pickerIcon, this.gridOptionsService);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    };
    AgPickerField.prototype.setupAria = function () {
        var ariaEl = this.getAriaElement();
        ariaEl.setAttribute('tabindex', (this.gridOptionsService.get('tabIndex')).toString());
        (0, aria_1.setAriaExpanded)(ariaEl, false);
        if (this.ariaRole) {
            (0, aria_1.setAriaRole)(ariaEl, this.ariaRole);
        }
    };
    AgPickerField.prototype.onLabelOrWrapperMouseDown = function (e) {
        if (e) {
            var focusableEl = this.getFocusableElement();
            // if the focusableEl is not the wrapper and the mousedown
            // targets the focusableEl, we should not expand/collapse the picker.
            // Note: this will happen when AgRichSelect is set with `allowTyping=true`
            if (focusableEl !== this.eWrapper && (e === null || e === void 0 ? void 0 : e.target) === focusableEl) {
                return;
            }
            // this prevents a BUG where MouseDown causes the element to be focused
            // after the picker is shown and focus ends up being lost.
            e.preventDefault();
            this.getFocusableElement().focus();
        }
        if (this.skipClick) {
            this.skipClick = false;
            return;
        }
        if (this.isDisabled()) {
            return;
        }
        if (this.isPickerDisplayed) {
            this.hidePicker();
        }
        else {
            this.showPicker();
        }
    };
    AgPickerField.prototype.onKeyDown = function (e) {
        switch (e.key) {
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.DOWN:
            case keyCode_1.KeyCode.ENTER:
            case keyCode_1.KeyCode.SPACE:
                e.preventDefault();
                this.onLabelOrWrapperMouseDown();
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
        if (!this.gridOptionsService.get('suppressScrollWhenPopupsAreOpen')) {
            this.destroyMouseWheelFunc = this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL, function () {
                _this.hidePicker();
            });
        }
        var translate = this.localeService.getLocaleTextFunc();
        var _a = this.config, pickerAriaLabelKey = _a.pickerAriaLabelKey, pickerAriaLabelValue = _a.pickerAriaLabelValue, _b = _a.modalPicker, modalPicker = _b === void 0 ? true : _b;
        var popupParams = {
            modal: modalPicker,
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
        var _c = this, maxPickerHeight = _c.maxPickerHeight, minPickerWidth = _c.minPickerWidth, maxPickerWidth = _c.maxPickerWidth, variableWidth = _c.variableWidth;
        if (variableWidth) {
            if (minPickerWidth) {
                ePicker.style.minWidth = minPickerWidth;
            }
            ePicker.style.width = (0, dom_1.formatSize)((0, dom_1.getAbsoluteWidth)(this.eWrapper));
            if (maxPickerWidth) {
                ePicker.style.maxWidth = maxPickerWidth;
            }
        }
        else {
            (0, dom_1.setElementWidth)(ePicker, maxPickerWidth !== null && maxPickerWidth !== void 0 ? maxPickerWidth : (0, dom_1.getAbsoluteWidth)(this.eWrapper));
        }
        var maxHeight = maxPickerHeight !== null && maxPickerHeight !== void 0 ? maxPickerHeight : "".concat((0, dom_1.getInnerHeight)(this.popupService.getPopupParent()), "px");
        ePicker.style.setProperty('max-height', maxHeight);
        ePicker.style.position = 'absolute';
        this.alignPickerToComponent();
        return addPopupRes.hideFunc;
    };
    AgPickerField.prototype.alignPickerToComponent = function () {
        if (!this.pickerComponent) {
            return;
        }
        var pickerType = this.config.pickerType;
        var pickerGap = this.pickerGap;
        var alignSide = this.gridOptionsService.get('enableRtl') ? 'right' : 'left';
        this.popupService.positionPopupByComponent({
            type: pickerType,
            eventSource: this.eWrapper,
            ePopup: this.pickerComponent.getGui(),
            position: 'under',
            alignSide: alignSide,
            keepWithinBounds: true,
            nudgeY: pickerGap
        });
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
        var ariaEl = this.getAriaElement();
        (0, aria_1.setAriaExpanded)(ariaEl, expanded);
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
    AgPickerField.prototype.setInputWidth = function (width) {
        (0, dom_1.setElementWidth)(this.eWrapper, width);
        return this;
    };
    AgPickerField.prototype.getFocusableElement = function () {
        return this.eWrapper;
    };
    AgPickerField.prototype.setPickerGap = function (gap) {
        this.pickerGap = gap;
        return this;
    };
    AgPickerField.prototype.setPickerMinWidth = function (width) {
        if (typeof width === 'number') {
            width = "".concat(width, "px");
        }
        this.minPickerWidth = width == null ? undefined : width;
        return this;
    };
    AgPickerField.prototype.setPickerMaxWidth = function (width) {
        if (typeof width === 'number') {
            width = "".concat(width, "px");
        }
        this.maxPickerWidth = width == null ? undefined : width;
        return this;
    };
    AgPickerField.prototype.setPickerMaxHeight = function (height) {
        if (typeof height === 'number') {
            height = "".concat(height, "px");
        }
        this.maxPickerHeight = height == null ? undefined : height;
        return this;
    };
    AgPickerField.prototype.destroy = function () {
        this.hidePicker();
        _super.prototype.destroy.call(this);
    };
    __decorate([
        (0, context_1.Autowired)('popupService')
    ], AgPickerField.prototype, "popupService", void 0);
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eLabel')
    ], AgPickerField.prototype, "eLabel", void 0);
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eWrapper')
    ], AgPickerField.prototype, "eWrapper", void 0);
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eDisplayField')
    ], AgPickerField.prototype, "eDisplayField", void 0);
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eIcon')
    ], AgPickerField.prototype, "eIcon", void 0);
    return AgPickerField;
}(agAbstractField_1.AgAbstractField));
exports.AgPickerField = AgPickerField;
