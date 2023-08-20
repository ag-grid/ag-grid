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
const generic_1 = require("../utils/generic");
const dom_1 = require("../utils/dom");
const keyCode_1 = require("../constants/keyCode");
const context_1 = require("../context/context");
class AgPickerField extends agAbstractField_1.AgAbstractField {
    constructor(config, className, pickerIcon, ariaRole) {
        super(config, 
        /* html */ `<div class="ag-picker-field" role="presentation">
                <div ref="eLabel"></div>
                <div ref="eWrapper"
                    class="ag-wrapper ag-picker-field-wrapper ag-picker-collapsed"
                    tabIndex="-1"
                    aria-expanded="false"
                    ${ariaRole ? `role="${ariaRole}"` : ''}
                >
                    <div ref="eDisplayField" class="ag-picker-field-display"></div>
                    <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                </div>
            </div>`, className);
        this.pickerIcon = pickerIcon;
        this.isPickerDisplayed = false;
        this.skipClick = false;
        this.pickerGap = 4;
        this.hideCurrentPicker = null;
        this.onPickerFocusIn = this.onPickerFocusIn.bind(this);
        this.onPickerFocusOut = this.onPickerFocusOut.bind(this);
        if ((config === null || config === void 0 ? void 0 : config.pickerGap) != null) {
            this.pickerGap = config.pickerGap;
        }
    }
    postConstruct() {
        super.postConstruct();
        const displayId = `ag-${this.getCompId()}-display`;
        this.eDisplayField.setAttribute('id', displayId);
        aria_1.setAriaDescribedBy(this.eWrapper, displayId);
        const eGui = this.getGui();
        this.addManagedListener(eGui, 'mousedown', (e) => {
            var _a;
            if (!this.skipClick &&
                ((_a = this.pickerComponent) === null || _a === void 0 ? void 0 : _a.isAlive()) &&
                dom_1.isVisible(this.pickerComponent.getGui()) &&
                eGui.contains(e.target)) {
                this.skipClick = true;
            }
        });
        const focusEl = this.getFocusableElement();
        this.addManagedListener(eGui, 'keydown', this.onKeyDown.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.clickHandler.bind(this));
        this.addManagedListener(focusEl, 'click', this.clickHandler.bind(this));
        if (this.pickerIcon) {
            const icon = icon_1.createIconNoSpan(this.pickerIcon, this.gridOptionsService);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    }
    refreshLabel() {
        if (generic_1.exists(this.getLabel())) {
            aria_1.setAriaLabelledBy(this.eWrapper, this.getLabelId());
        }
        else {
            this.eWrapper.removeAttribute('aria-labelledby');
        }
        super.refreshLabel();
    }
    clickHandler() {
        if (this.skipClick) {
            this.skipClick = false;
            return;
        }
        if (this.isDisabled()) {
            return;
        }
        this.showPicker();
    }
    onKeyDown(e) {
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
        if (!this.gridOptionsService.is('suppressScrollWhenPopupsAreOpen')) {
            this.destroyMouseWheelFunc = this.addManagedListener(eDocument.body, 'wheel', (e) => {
                if (!ePicker.contains(e.target)) {
                    this.hidePicker();
                }
            });
        }
        const translate = this.localeService.getLocaleTextFunc();
        const { pickerType, pickerAriaLabelKey, pickerAriaLabelValue } = this.config;
        const popupParams = {
            modal: true,
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
        aria_1.setAriaExpanded(this.eWrapper, expanded);
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
    setAriaLabel(label) {
        aria_1.setAriaLabel(this.eWrapper, label);
        return this;
    }
    setInputWidth(width) {
        dom_1.setElementWidth(this.eWrapper, width);
        return this;
    }
    getFocusableElement() {
        return this.eWrapper;
    }
    setPickerGap(gap) {
        this.pickerGap = gap;
        return this;
    }
    destroy() {
        this.hidePicker();
        super.destroy();
    }
}
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
exports.AgPickerField = AgPickerField;
