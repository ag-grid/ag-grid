/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const agAbstractField_1 = require("./agAbstractField");
const agPickerField_1 = require("./agPickerField");
const agList_1 = require("./agList");
const context_1 = require("../context/context");
const dom_1 = require("../utils/dom");
const aria_1 = require("../utils/aria");
class AgSelect extends agPickerField_1.AgPickerField {
    constructor(config) {
        super(config, 'ag-select', 'smallDown', 'listbox');
    }
    init() {
        this.listComponent = this.createBean(new agList_1.AgList('select'));
        this.listComponent.setParentComponent(this);
        this.eWrapper.tabIndex = 0;
        this.listComponent.addManagedListener(this.listComponent, agList_1.AgList.EVENT_ITEM_SELECTED, () => { if (this.hideList) {
            this.hideList();
        } });
        this.listComponent.addManagedListener(this.listComponent, agAbstractField_1.AgAbstractField.EVENT_CHANGED, () => {
            this.setValue(this.listComponent.getValue(), false, true);
            if (this.hideList) {
                this.hideList();
            }
        });
    }
    showPicker() {
        const listGui = this.listComponent.getGui();
        const eDocument = this.gridOptionsWrapper.getDocument();
        const destroyMouseWheelFunc = this.addManagedListener(eDocument.body, 'wheel', (e) => {
            if (!listGui.contains(e.target) && this.hideList) {
                this.hideList();
            }
        });
        const destroyFocusOutFunc = this.addManagedListener(listGui, 'focusout', (e) => {
            if (!listGui.contains(e.relatedTarget) && this.hideList) {
                this.hideList();
            }
        });
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: listGui,
            closeOnEsc: true,
            closedCallback: () => {
                this.hideList = null;
                this.isPickerDisplayed = false;
                destroyFocusOutFunc();
                destroyMouseWheelFunc();
                if (this.isAlive()) {
                    aria_1.setAriaExpanded(this.eWrapper, false);
                    this.getFocusableElement().focus();
                }
            },
            ariaLabel: translate('ariaLabelSelectField', 'Select Field')
        });
        if (addPopupRes) {
            this.hideList = addPopupRes.hideFunc;
        }
        this.isPickerDisplayed = true;
        dom_1.setElementWidth(listGui, dom_1.getAbsoluteWidth(this.eWrapper));
        aria_1.setAriaExpanded(this.eWrapper, true);
        listGui.style.maxHeight = dom_1.getInnerHeight(this.popupService.getPopupParent()) + 'px';
        listGui.style.position = 'absolute';
        this.popupService.positionPopupUnderComponent({
            type: 'ag-list',
            eventSource: this.eWrapper,
            ePopup: listGui,
            keepWithinBounds: true
        });
        this.listComponent.refreshHighlighted();
        return this.listComponent;
    }
    addOptions(options) {
        options.forEach(option => this.addOption(option));
        return this;
    }
    addOption(option) {
        this.listComponent.addOption(option);
        return this;
    }
    setValue(value, silent, fromPicker) {
        if (this.value === value) {
            return this;
        }
        if (!fromPicker) {
            this.listComponent.setValue(value, true);
        }
        const newValue = this.listComponent.getValue();
        if (newValue === this.getValue()) {
            return this;
        }
        this.eDisplayField.innerHTML = this.listComponent.getDisplayValue();
        return super.setValue(value, silent);
    }
    destroy() {
        if (this.hideList) {
            this.hideList();
        }
        this.destroyBean(this.listComponent);
        super.destroy();
    }
}
__decorate([
    context_1.Autowired('popupService')
], AgSelect.prototype, "popupService", void 0);
__decorate([
    context_1.PostConstruct
], AgSelect.prototype, "init", null);
exports.AgSelect = AgSelect;
