"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgSelect = void 0;
const agPickerField_1 = require("./agPickerField");
const agList_1 = require("./agList");
const eventKeys_1 = require("../eventKeys");
const keyCode_1 = require("../constants/keyCode");
class AgSelect extends agPickerField_1.AgPickerField {
    constructor(config) {
        super(Object.assign({ pickerAriaLabelKey: 'ariaLabelSelectField', pickerAriaLabelValue: 'Select Field', pickerType: 'ag-list', className: 'ag-select', pickerIcon: 'smallDown', ariaRole: 'listbox' }, config));
    }
    postConstruct() {
        var _a;
        super.postConstruct();
        this.createListComponent();
        this.eWrapper.tabIndex = (_a = this.gridOptionsService.getNum('tabIndex')) !== null && _a !== void 0 ? _a : 0;
    }
    createListComponent() {
        this.listComponent = this.createBean(new agList_1.AgList('select'));
        this.listComponent.setParentComponent(this);
        this.listComponent.addGuiEventListener('keydown', (e) => {
            if (e.key === keyCode_1.KeyCode.TAB) {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.getGui().dispatchEvent(new KeyboardEvent('keydown', {
                    key: e.key,
                    shiftKey: e.shiftKey,
                    ctrlKey: e.ctrlKey,
                    bubbles: true
                }));
            }
            ;
        });
        this.listComponent.addManagedListener(this.listComponent, agList_1.AgList.EVENT_ITEM_SELECTED, () => {
            this.hidePicker();
            this.dispatchEvent({ type: AgSelect.EVENT_ITEM_SELECTED });
        });
        this.listComponent.addManagedListener(this.listComponent, eventKeys_1.Events.EVENT_FIELD_VALUE_CHANGED, () => {
            if (!this.listComponent) {
                return;
            }
            this.setValue(this.listComponent.getValue(), false, true);
            this.hidePicker();
        });
    }
    createPickerComponent() {
        // do not create the picker every time to save state
        return this.listComponent;
    }
    showPicker() {
        if (!this.listComponent) {
            return;
        }
        super.showPicker();
        this.listComponent.refreshHighlighted();
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
        if (this.value === value || !this.listComponent) {
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
        if (this.listComponent) {
            this.destroyBean(this.listComponent);
            this.listComponent = undefined;
        }
        super.destroy();
    }
}
exports.AgSelect = AgSelect;
AgSelect.EVENT_ITEM_SELECTED = 'selectedItem';
