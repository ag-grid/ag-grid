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
import { PostConstruct } from '../context/context';
import { Component } from '../widgets/component';
import { Events } from '../events';
import { RefSelector } from '../widgets/componentAnnotations';
import { RowNode } from '../entities/rowNode';
import { stopPropagationForAgGrid } from '../utils/event';
var CheckboxSelectionComponent = /** @class */ (function (_super) {
    __extends(CheckboxSelectionComponent, _super);
    function CheckboxSelectionComponent() {
        return _super.call(this, /* html*/ "\n            <div class=\"ag-selection-checkbox\" role=\"presentation\">\n                <ag-checkbox role=\"presentation\" ref=\"eCheckbox\"></ag-checkbox>\n            </div>") || this;
    }
    CheckboxSelectionComponent.prototype.postConstruct = function () {
        this.eCheckbox.setPassive(true);
    };
    CheckboxSelectionComponent.prototype.getCheckboxId = function () {
        return this.eCheckbox.getInputElement().id;
    };
    CheckboxSelectionComponent.prototype.onDataChanged = function () {
        // when rows are loaded for the second time, this can impact the selection, as a row
        // could be loaded as already selected (if user scrolls down, and then up again).
        this.onSelectionChanged();
    };
    CheckboxSelectionComponent.prototype.onSelectableChanged = function () {
        this.showOrHideSelect();
    };
    CheckboxSelectionComponent.prototype.onSelectionChanged = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var state = this.rowNode.isSelected();
        var stateName = state === undefined
            ? translate('ariaIndeterminate', 'indeterminate')
            : (state === true
                ? translate('ariaChecked', 'checked')
                : translate('ariaUnchecked', 'unchecked'));
        var ariaLabel = translate('ariaRowToggleSelection', 'Press Space to toggle row selection');
        this.eCheckbox.setValue(state, true);
        this.eCheckbox.setInputAriaLabel(ariaLabel + " (" + stateName + ")");
    };
    CheckboxSelectionComponent.prototype.onCheckedClicked = function (event) {
        var groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        var updatedCount = this.rowNode.setSelectedParams({ newValue: false, rangeSelect: event.shiftKey, groupSelectsFiltered: groupSelectsFiltered });
        return updatedCount;
    };
    CheckboxSelectionComponent.prototype.onUncheckedClicked = function (event) {
        var groupSelectsFiltered = this.gridOptionsWrapper.isGroupSelectsFiltered();
        var updatedCount = this.rowNode.setSelectedParams({ newValue: true, rangeSelect: event.shiftKey, groupSelectsFiltered: groupSelectsFiltered });
        return updatedCount;
    };
    CheckboxSelectionComponent.prototype.init = function (params) {
        var _this = this;
        this.rowNode = params.rowNode;
        this.column = params.column;
        this.onSelectionChanged();
        // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
        // would possibly get selected twice
        this.addGuiEventListener('click', function (event) { return stopPropagationForAgGrid(event); });
        // likewise we don't want double click on this icon to open a group
        this.addGuiEventListener('dblclick', function (event) { return stopPropagationForAgGrid(event); });
        this.addManagedListener(this.eCheckbox.getInputElement(), 'click', function (event) {
            var isSelected = _this.eCheckbox.getValue();
            var previousValue = _this.eCheckbox.getPreviousValue();
            if (previousValue === undefined) { // indeterminate
                var result = _this.onUncheckedClicked(event || {});
                if (result === 0) {
                    _this.onCheckedClicked(event);
                }
            }
            else if (isSelected) {
                _this.onCheckedClicked(event);
            }
            else {
                _this.onUncheckedClicked(event || {});
            }
        });
        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onDataChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_SELECTABLE_CHANGED, this.onSelectableChanged.bind(this));
        var isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
        var checkboxVisibleIsDynamic = isRowSelectableFunc || this.checkboxCallbackExists();
        if (checkboxVisibleIsDynamic) {
            var showOrHideSelectListener = this.showOrHideSelect.bind(this);
            this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, showOrHideSelectListener);
            this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, showOrHideSelectListener);
            this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, showOrHideSelectListener);
            this.showOrHideSelect();
        }
        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');
    };
    CheckboxSelectionComponent.prototype.showOrHideSelect = function () {
        // if the isRowSelectable() is not provided the row node is selectable by default
        var selectable = this.rowNode.selectable;
        // checkboxSelection callback is deemed a legacy solution however we will still consider it's result.
        // If selectable, then also check the colDef callback. if not selectable, this it short circuits - no need
        // to call the colDef callback.
        if (selectable && this.checkboxCallbackExists()) {
            selectable = this.column.isCellCheckboxSelection(this.rowNode);
        }
        // show checkbox if both conditions are true
        this.setVisible(selectable);
    };
    CheckboxSelectionComponent.prototype.checkboxCallbackExists = function () {
        // column will be missing if groupUseEntireRow=true
        var colDef = this.column ? this.column.getColDef() : null;
        return !!colDef && typeof colDef.checkboxSelection === 'function';
    };
    __decorate([
        RefSelector('eCheckbox')
    ], CheckboxSelectionComponent.prototype, "eCheckbox", void 0);
    __decorate([
        PostConstruct
    ], CheckboxSelectionComponent.prototype, "postConstruct", null);
    return CheckboxSelectionComponent;
}(Component));
export { CheckboxSelectionComponent };
