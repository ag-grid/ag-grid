/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
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
const context_1 = require("../context/context");
const component_1 = require("../widgets/component");
const events_1 = require("../events");
const componentAnnotations_1 = require("../widgets/componentAnnotations");
const rowNode_1 = require("../entities/rowNode");
const event_1 = require("../utils/event");
class CheckboxSelectionComponent extends component_1.Component {
    constructor() {
        super(/* html*/ `
            <div class="ag-selection-checkbox" role="presentation">
                <ag-checkbox role="presentation" ref="eCheckbox"></ag-checkbox>
            </div>`);
    }
    postConstruct() {
        this.eCheckbox.setPassive(true);
    }
    getCheckboxId() {
        return this.eCheckbox.getInputElement().id;
    }
    onDataChanged() {
        // when rows are loaded for the second time, this can impact the selection, as a row
        // could be loaded as already selected (if user scrolls down, and then up again).
        this.onSelectionChanged();
    }
    onSelectableChanged() {
        this.showOrHideSelect();
    }
    onSelectionChanged() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const state = this.rowNode.isSelected();
        const stateName = state === undefined
            ? translate('ariaIndeterminate', 'indeterminate')
            : (state === true
                ? translate('ariaChecked', 'checked')
                : translate('ariaUnchecked', 'unchecked'));
        const ariaLabel = translate('ariaRowToggleSelection', 'Press Space to toggle row selection');
        this.eCheckbox.setValue(state, true);
        this.eCheckbox.setInputAriaLabel(`${ariaLabel} (${stateName})`);
    }
    onCheckedClicked(event) {
        const groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        const updatedCount = this.rowNode.setSelectedParams({ newValue: false, rangeSelect: event.shiftKey, groupSelectsFiltered: groupSelectsFiltered });
        return updatedCount;
    }
    onUncheckedClicked(event) {
        const groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        const updatedCount = this.rowNode.setSelectedParams({ newValue: true, rangeSelect: event.shiftKey, groupSelectsFiltered: groupSelectsFiltered });
        return updatedCount;
    }
    init(params) {
        this.rowNode = params.rowNode;
        this.column = params.column;
        this.overrides = params.overrides;
        this.onSelectionChanged();
        // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
        // would possibly get selected twice
        this.addGuiEventListener('click', event => event_1.stopPropagationForAgGrid(event));
        // likewise we don't want double click on this icon to open a group
        this.addGuiEventListener('dblclick', event => event_1.stopPropagationForAgGrid(event));
        this.addManagedListener(this.eCheckbox.getInputElement(), 'click', (event) => {
            const isSelected = this.eCheckbox.getValue();
            const previousValue = this.eCheckbox.getPreviousValue();
            if (previousValue === undefined || isSelected === undefined) {
                // Indeterminate state - try toggling children to determine action.
                const result = this.onUncheckedClicked(event || {});
                if (result === 0) {
                    this.onCheckedClicked(event);
                }
            }
            else if (isSelected) {
                this.onCheckedClicked(event);
            }
            else {
                this.onUncheckedClicked(event || {});
            }
        });
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.onDataChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_SELECTABLE_CHANGED, this.onSelectableChanged.bind(this));
        const isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
        const checkboxVisibleIsDynamic = isRowSelectableFunc || typeof this.getIsVisible() === 'function';
        if (checkboxVisibleIsDynamic) {
            const showOrHideSelectListener = this.showOrHideSelect.bind(this);
            this.addManagedListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, showOrHideSelectListener);
            this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, showOrHideSelectListener);
            this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, showOrHideSelectListener);
            this.showOrHideSelect();
        }
        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');
    }
    showOrHideSelect() {
        var _a, _b, _c, _d;
        // if the isRowSelectable() is not provided the row node is selectable by default
        let selectable = this.rowNode.selectable;
        // checkboxSelection callback is deemed a legacy solution however we will still consider it's result.
        // If selectable, then also check the colDef callback. if not selectable, this it short circuits - no need
        // to call the colDef callback.
        const isVisible = this.getIsVisible();
        if (selectable) {
            if (typeof isVisible === 'function') {
                const extraParams = (_a = this.overrides) === null || _a === void 0 ? void 0 : _a.callbackParams;
                const params = (_b = this.column) === null || _b === void 0 ? void 0 : _b.createColumnFunctionCallbackParams(this.rowNode);
                selectable = params ? isVisible(Object.assign(Object.assign({}, extraParams), params)) : false;
            }
            else {
                selectable = (isVisible !== null && isVisible !== void 0 ? isVisible : false);
            }
        }
        const disableInsteadOfHide = (_c = this.column) === null || _c === void 0 ? void 0 : _c.getColDef().showDisabledCheckboxes;
        if (disableInsteadOfHide) {
            this.eCheckbox.setDisabled(!selectable);
            this.setVisible(true);
            this.setDisplayed(true);
            return;
        }
        if ((_d = this.overrides) === null || _d === void 0 ? void 0 : _d.removeHidden) {
            this.setDisplayed(selectable);
            return;
        }
        this.setVisible(selectable);
    }
    getIsVisible() {
        var _a, _b;
        if (this.overrides) {
            return this.overrides.isVisible;
        }
        // column will be missing if groupUseEntireRow=true
        return (_b = (_a = this.column) === null || _a === void 0 ? void 0 : _a.getColDef()) === null || _b === void 0 ? void 0 : _b.checkboxSelection;
    }
}
__decorate([
    componentAnnotations_1.RefSelector('eCheckbox')
], CheckboxSelectionComponent.prototype, "eCheckbox", void 0);
__decorate([
    context_1.PostConstruct
], CheckboxSelectionComponent.prototype, "postConstruct", null);
exports.CheckboxSelectionComponent = CheckboxSelectionComponent;
