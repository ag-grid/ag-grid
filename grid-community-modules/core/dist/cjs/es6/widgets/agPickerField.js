"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgPickerField = void 0;
const agAbstractField_1 = require("./agAbstractField");
const componentAnnotations_1 = require("./componentAnnotations");
const aria_1 = require("../utils/aria");
const icon_1 = require("../utils/icon");
const dom_1 = require("../utils/dom");
const keyCode_1 = require("../constants/keyCode");
const context_1 = require("../context/context");
const eventKeys_1 = require("../eventKeys");
const TEMPLATE = /* html */ `
    <div class="ag-picker-field" role="presentation">
        <div ref="eLabel"></div>
            <div ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper ag-picker-collapsed">
            <div ref="eDisplayField" class="ag-picker-field-display"></div>
            <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
        </div>
    </div>`;
class AgPickerField extends agAbstractField_1.AgAbstractField {
    constructor(config) {
        super(config, (config === null || config === void 0 ? void 0 : config.template) || TEMPLATE, config === null || config === void 0 ? void 0 : config.className);
        this.isPickerDisplayed = false;
        this.skipClick = false;
        this.pickerGap = 4;
        this.hideCurrentPicker = null;
        this.ariaRole = config === null || config === void 0 ? void 0 : config.ariaRole;
        this.onPickerFocusIn = this.onPickerFocusIn.bind(this);
        this.onPickerFocusOut = this.onPickerFocusOut.bind(this);
        if (!config) {
            return;
        }
        const { pickerGap, maxPickerHeight, variableWidth, minPickerWidth, maxPickerWidth } = config;
        if (pickerGap != null) {
            this.pickerGap = pickerGap;
        }
        this.variableWidth = !!variableWidth;
        if (maxPickerHeight != null) {
            this.setPickerMaxHeight(maxPickerHeight);
        }
        if (minPickerWidth != null) {
            this.setPickerMinWidth(minPickerWidth);
        }
        if (maxPickerWidth != null) {
            this.setPickerMaxWidth(maxPickerWidth);
        }
    }
    postConstruct() {
        super.postConstruct();
        this.setupAria();
        const displayId = `ag-${this.getCompId()}-display`;
        this.eDisplayField.setAttribute('id', displayId);
        const ariaEl = this.getAriaElement();
        this.addManagedListener(ariaEl, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(this.eLabel, 'mousedown', this.onLabelOrWrapperMouseDown.bind(this));
        this.addManagedListener(this.eWrapper, 'mousedown', this.onLabelOrWrapperMouseDown.bind(this));
        const { pickerIcon } = this.config;
        if (pickerIcon) {
            const icon = (0, icon_1.createIconNoSpan)(pickerIcon, this.gridOptionsService);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    }
    setupAria() {
        const ariaEl = this.getAriaElement();
        ariaEl.setAttribute('tabindex', (this.gridOptionsService.get('tabIndex')).toString());
        (0, aria_1.setAriaExpanded)(ariaEl, false);
        if (this.ariaRole) {
            (0, aria_1.setAriaRole)(ariaEl, this.ariaRole);
        }
    }
    onLabelOrWrapperMouseDown(e) {
        if (e) {
            const focusableEl = this.getFocusableElement();
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
    }
    onKeyDown(e) {
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
    }
    showPicker() {
        this.isPickerDisplayed = true;
        if (!this.pickerComponent) {
            this.pickerComponent = this.createPickerComponent();
        }
        const pickerGui = this.pickerComponent.getGui();
        pickerGui.addEventListener('focusin', this.onPickerFocusIn);
        pickerGui.addEventListener('focusout', this.onPickerFocusOut);
        this.hideCurrentPicker = this.renderAndPositionPicker();
        this.toggleExpandedStyles(true);
    }
    renderAndPositionPicker() {
        const eDocument = this.gridOptionsService.getDocument();
        const ePicker = this.pickerComponent.getGui();
        if (!this.gridOptionsService.get('suppressScrollWhenPopupsAreOpen')) {
            this.destroyMouseWheelFunc = this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL, () => {
                this.hidePicker();
            });
        }
        const translate = this.localeService.getLocaleTextFunc();
        const { pickerAriaLabelKey, pickerAriaLabelValue, modalPicker = true } = this.config;
        const popupParams = {
            modal: modalPicker,
            eChild: ePicker,
            closeOnEsc: true,
            closedCallback: () => {
                const shouldRestoreFocus = eDocument.activeElement === eDocument.body;
                this.beforeHidePicker();
                if (shouldRestoreFocus && this.isAlive()) {
                    this.getFocusableElement().focus();
                }
            },
            ariaLabel: translate(pickerAriaLabelKey, pickerAriaLabelValue),
        };
        const addPopupRes = this.popupService.addPopup(popupParams);
        const { maxPickerHeight, minPickerWidth, maxPickerWidth, variableWidth } = this;
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
        const maxHeight = maxPickerHeight !== null && maxPickerHeight !== void 0 ? maxPickerHeight : `${(0, dom_1.getInnerHeight)(this.popupService.getPopupParent())}px`;
        ePicker.style.setProperty('max-height', maxHeight);
        ePicker.style.position = 'absolute';
        this.alignPickerToComponent();
        return addPopupRes.hideFunc;
    }
    alignPickerToComponent() {
        if (!this.pickerComponent) {
            return;
        }
        const { pickerType } = this.config;
        const { pickerGap } = this;
        const alignSide = this.gridOptionsService.get('enableRtl') ? 'right' : 'left';
        this.popupService.positionPopupByComponent({
            type: pickerType,
            eventSource: this.eWrapper,
            ePopup: this.pickerComponent.getGui(),
            position: 'under',
            alignSide,
            keepWithinBounds: true,
            nudgeY: pickerGap
        });
    }
    beforeHidePicker() {
        if (this.destroyMouseWheelFunc) {
            this.destroyMouseWheelFunc();
            this.destroyMouseWheelFunc = undefined;
        }
        this.toggleExpandedStyles(false);
        const pickerGui = this.pickerComponent.getGui();
        pickerGui.removeEventListener('focusin', this.onPickerFocusIn);
        pickerGui.removeEventListener('focusout', this.onPickerFocusOut);
        this.isPickerDisplayed = false;
        this.pickerComponent = undefined;
        this.hideCurrentPicker = null;
    }
    toggleExpandedStyles(expanded) {
        if (!this.isAlive()) {
            return;
        }
        const ariaEl = this.getAriaElement();
        (0, aria_1.setAriaExpanded)(ariaEl, expanded);
        this.eWrapper.classList.toggle('ag-picker-expanded', expanded);
        this.eWrapper.classList.toggle('ag-picker-collapsed', !expanded);
    }
    onPickerFocusIn() {
        this.togglePickerHasFocus(true);
    }
    onPickerFocusOut(e) {
        var _a;
        if (!((_a = this.pickerComponent) === null || _a === void 0 ? void 0 : _a.getGui().contains(e.relatedTarget))) {
            this.togglePickerHasFocus(false);
        }
    }
    togglePickerHasFocus(focused) {
        if (!this.pickerComponent) {
            return;
        }
        this.eWrapper.classList.toggle('ag-picker-has-focus', focused);
    }
    hidePicker() {
        if (this.hideCurrentPicker) {
            this.hideCurrentPicker();
        }
    }
    setInputWidth(width) {
        (0, dom_1.setElementWidth)(this.eWrapper, width);
        return this;
    }
    getFocusableElement() {
        return this.eWrapper;
    }
    setPickerGap(gap) {
        this.pickerGap = gap;
        return this;
    }
    setPickerMinWidth(width) {
        if (typeof width === 'number') {
            width = `${width}px`;
        }
        this.minPickerWidth = width == null ? undefined : width;
        return this;
    }
    setPickerMaxWidth(width) {
        if (typeof width === 'number') {
            width = `${width}px`;
        }
        this.maxPickerWidth = width == null ? undefined : width;
        return this;
    }
    setPickerMaxHeight(height) {
        if (typeof height === 'number') {
            height = `${height}px`;
        }
        this.maxPickerHeight = height == null ? undefined : height;
        return this;
    }
    destroy() {
        this.hidePicker();
        super.destroy();
    }
}
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
exports.AgPickerField = AgPickerField;
