/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgAbstractField } from "./agAbstractField";
import { AgPickerField } from "./agPickerField";
import { AgList } from "./agList";
import { Autowired, PostConstruct } from "../context/context";
import { setElementWidth, getAbsoluteWidth, getInnerHeight } from "../utils/dom";
import { setAriaExpanded } from "../utils/aria";
export class AgSelect extends AgPickerField {
    constructor(config) {
        super(config, 'ag-select', 'smallDown', 'listbox');
    }
    init() {
        this.listComponent = this.createBean(new AgList('select'));
        this.listComponent.setParentComponent(this);
        this.eWrapper.tabIndex = 0;
        this.listComponent.addManagedListener(this.listComponent, AgList.EVENT_ITEM_SELECTED, () => {
            if (this.hideList) {
                this.hideList();
            }
            this.dispatchEvent({ type: AgSelect.EVENT_ITEM_SELECTED });
        });
        this.listComponent.addManagedListener(this.listComponent, AgAbstractField.EVENT_CHANGED, () => {
            this.setValue(this.listComponent.getValue(), false, true);
            if (this.hideList) {
                this.hideList();
            }
        });
    }
    showPicker() {
        const listGui = this.listComponent.getGui();
        const eDocument = this.gridOptionsService.getDocument();
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
        const translate = this.localeService.getLocaleTextFunc();
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
                    setAriaExpanded(this.eWrapper, false);
                    this.getFocusableElement().focus();
                }
            },
            ariaLabel: translate('ariaLabelSelectField', 'Select Field')
        });
        if (addPopupRes) {
            this.hideList = addPopupRes.hideFunc;
        }
        this.isPickerDisplayed = true;
        setElementWidth(listGui, getAbsoluteWidth(this.eWrapper));
        setAriaExpanded(this.eWrapper, true);
        listGui.style.maxHeight = getInnerHeight(this.popupService.getPopupParent()) + 'px';
        listGui.style.position = 'absolute';
        this.popupService.positionPopupByComponent({
            type: 'ag-list',
            eventSource: this.eWrapper,
            ePopup: listGui,
            position: 'under',
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
AgSelect.EVENT_ITEM_SELECTED = 'selectedItem';
__decorate([
    Autowired('popupService')
], AgSelect.prototype, "popupService", void 0);
__decorate([
    PostConstruct
], AgSelect.prototype, "init", null);
