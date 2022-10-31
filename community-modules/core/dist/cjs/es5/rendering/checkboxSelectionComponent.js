/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var component_1 = require("../widgets/component");
var events_1 = require("../events");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var rowNode_1 = require("../entities/rowNode");
var event_1 = require("../utils/event");
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
        this.overrides = params.overrides;
        this.onSelectionChanged();
        // we don't want double click on this icon to open a group
        this.addManagedListener(this.eCheckbox.getInputElement(), 'dblclick', function (event) {
            event_1.stopPropagationForAgGrid(event);
        });
        this.addManagedListener(this.eCheckbox.getInputElement(), 'click', function (event) {
            // we don't want the row clicked event to fire when selecting the checkbox, otherwise the row
            // would possibly get selected twice
            event_1.stopPropagationForAgGrid(event);
            var isSelected = _this.eCheckbox.getValue();
            var previousValue = _this.eCheckbox.getPreviousValue();
            if (previousValue === undefined || isSelected === undefined) {
                // Indeterminate state - try toggling children to determine action.
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
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_SELECTED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.onDataChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_SELECTABLE_CHANGED, this.onSelectableChanged.bind(this));
        var isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
        var checkboxVisibleIsDynamic = isRowSelectableFunc || typeof this.getIsVisible() === 'function';
        if (checkboxVisibleIsDynamic) {
            var showOrHideSelectListener = this.showOrHideSelect.bind(this);
            this.addManagedListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, showOrHideSelectListener);
            this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, showOrHideSelectListener);
            this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, showOrHideSelectListener);
            this.showOrHideSelect();
        }
        this.eCheckbox.getInputElement().setAttribute('tabindex', '-1');
    };
    CheckboxSelectionComponent.prototype.showOrHideSelect = function () {
        var _a, _b, _c, _d;
        // if the isRowSelectable() is not provided the row node is selectable by default
        var selectable = this.rowNode.selectable;
        // checkboxSelection callback is deemed a legacy solution however we will still consider it's result.
        // If selectable, then also check the colDef callback. if not selectable, this it short circuits - no need
        // to call the colDef callback.
        var isVisible = this.getIsVisible();
        if (selectable) {
            if (typeof isVisible === 'function') {
                var extraParams = (_a = this.overrides) === null || _a === void 0 ? void 0 : _a.callbackParams;
                var params = (_b = this.column) === null || _b === void 0 ? void 0 : _b.createColumnFunctionCallbackParams(this.rowNode);
                selectable = params ? isVisible(__assign(__assign({}, extraParams), params)) : false;
            }
            else {
                selectable = (isVisible !== null && isVisible !== void 0 ? isVisible : false);
            }
        }
        var disableInsteadOfHide = (_c = this.column) === null || _c === void 0 ? void 0 : _c.getColDef().showDisabledCheckboxes;
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
    };
    CheckboxSelectionComponent.prototype.getIsVisible = function () {
        var _a, _b;
        if (this.overrides) {
            return this.overrides.isVisible;
        }
        // column will be missing if groupUseEntireRow=true
        return (_b = (_a = this.column) === null || _a === void 0 ? void 0 : _a.getColDef()) === null || _b === void 0 ? void 0 : _b.checkboxSelection;
    };
    __decorate([
        componentAnnotations_1.RefSelector('eCheckbox')
    ], CheckboxSelectionComponent.prototype, "eCheckbox", void 0);
    __decorate([
        context_1.PostConstruct
    ], CheckboxSelectionComponent.prototype, "postConstruct", null);
    return CheckboxSelectionComponent;
}(component_1.Component));
exports.CheckboxSelectionComponent = CheckboxSelectionComponent;
