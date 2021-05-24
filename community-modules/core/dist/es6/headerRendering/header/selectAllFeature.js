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
import { AgCheckbox } from "../../widgets/agCheckbox";
import { BeanStub } from "../../context/beanStub";
import { PostConstruct, Autowired } from "../../context/context";
import { Events } from "../../events";
import { Constants } from "../../constants/constants";
import { getAriaDescribedBy, setAriaDescribedBy } from "../../utils/aria";
import { isVisible } from "../../utils/dom";
var SelectAllFeature = /** @class */ (function (_super) {
    __extends(SelectAllFeature, _super);
    function SelectAllFeature(cbSelectAll, column) {
        var _this = _super.call(this) || this;
        _this.cbSelectAllVisible = false;
        _this.processingEventFromCheckbox = false;
        _this.cbSelectAll = cbSelectAll;
        _this.column = column;
        var colDef = column.getColDef();
        _this.filteredOnly = colDef ? !!colDef.headerCheckboxSelectionFilteredOnly : false;
        return _this;
    }
    SelectAllFeature.prototype.postConstruct = function () {
        this.showOrHideSelectAll();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideSelectAll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelectAll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onModelChanged.bind(this));
        this.addManagedListener(this.cbSelectAll, AgCheckbox.EVENT_CHANGED, this.onCbSelectAll.bind(this));
        this.cbSelectAll.getInputElement().setAttribute('tabindex', '-1');
        this.refreshSelectAllLabel();
    };
    SelectAllFeature.prototype.showOrHideSelectAll = function () {
        this.cbSelectAllVisible = this.isCheckboxSelection();
        this.cbSelectAll.setDisplayed(this.cbSelectAllVisible);
        if (this.cbSelectAllVisible) {
            // in case user is trying this feature with the wrong model type
            this.checkRightRowModelType();
            // make sure checkbox is showing the right state
            this.updateStateOfCheckbox();
        }
        this.refreshHeaderAriaDescribedBy(this.cbSelectAllVisible);
    };
    SelectAllFeature.prototype.refreshHeaderAriaDescribedBy = function (isSelectAllVisible) {
        var parentHeader = this.cbSelectAll.getParentComponent();
        var parentHeaderGui = parentHeader && parentHeader.getGui();
        if (!parentHeaderGui || !isVisible(parentHeaderGui)) {
            return;
        }
        var describedByIds = '';
        if (parentHeaderGui) {
            describedByIds = getAriaDescribedBy(parentHeaderGui);
        }
        var cbSelectAllId = this.cbSelectAll.getInputElement().id;
        var describedByIdsHasSelectAllFeature = describedByIds.indexOf(cbSelectAllId) !== -1;
        if (isSelectAllVisible) {
            if (!describedByIdsHasSelectAllFeature) {
                setAriaDescribedBy(parentHeaderGui, cbSelectAllId + " " + describedByIds.trim());
            }
        }
        else if (describedByIdsHasSelectAllFeature) {
            setAriaDescribedBy(parentHeaderGui, describedByIds.trim().split(' ').filter(function (id) { return id === cbSelectAllId; }).join(' '));
        }
    };
    SelectAllFeature.prototype.onModelChanged = function () {
        if (!this.cbSelectAllVisible) {
            return;
        }
        this.updateStateOfCheckbox();
    };
    SelectAllFeature.prototype.onSelectionChanged = function () {
        if (!this.cbSelectAllVisible) {
            return;
        }
        this.updateStateOfCheckbox();
    };
    SelectAllFeature.prototype.getNextCheckboxState = function (selectionCount) {
        // if no rows, always have it unselected
        if (selectionCount.selected === 0 && selectionCount.notSelected === 0) {
            return false;
        }
        // if mix of selected and unselected, this is the tri-state
        if (selectionCount.selected > 0 && selectionCount.notSelected > 0) {
            return null;
        }
        // only selected
        if (selectionCount.selected > 0) {
            return true;
        }
        // nothing selected
        return false;
    };
    SelectAllFeature.prototype.updateStateOfCheckbox = function () {
        if (this.processingEventFromCheckbox) {
            return;
        }
        this.processingEventFromCheckbox = true;
        var selectionCount = this.getSelectionCount();
        var allSelected = this.getNextCheckboxState(selectionCount);
        this.cbSelectAll.setValue(allSelected);
        this.refreshSelectAllLabel();
        this.processingEventFromCheckbox = false;
    };
    SelectAllFeature.prototype.refreshSelectAllLabel = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var checked = this.cbSelectAll.getValue();
        var ariaStatus = checked ? translate('ariaChecked', 'checked') : translate('ariaUnchecked', 'unchecked');
        var ariaLabel = translate('ariaRowSelectAll', 'Press Space to toggle all rows selection');
        this.cbSelectAll.setInputAriaLabel(ariaLabel + " (" + ariaStatus + ")");
    };
    SelectAllFeature.prototype.getSelectionCount = function () {
        var _this = this;
        var selectedCount = 0;
        var notSelectedCount = 0;
        var callback = function (node) {
            if (_this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
                return;
            }
            if (node.isSelected()) {
                selectedCount++;
            }
            else if (!node.selectable) {
                // don't count non-selectable nodes!
            }
            else {
                notSelectedCount++;
            }
        };
        if (this.filteredOnly) {
            this.gridApi.forEachNodeAfterFilter(callback);
        }
        else {
            this.gridApi.forEachNode(callback);
        }
        return {
            notSelected: notSelectedCount,
            selected: selectedCount
        };
    };
    SelectAllFeature.prototype.checkRightRowModelType = function () {
        var rowModelType = this.rowModel.getType();
        var rowModelMatches = rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        if (!rowModelMatches) {
            console.warn("AG Grid: selectAllCheckbox is only available if using normal row model, you are using " + rowModelType);
        }
    };
    SelectAllFeature.prototype.onCbSelectAll = function () {
        if (this.processingEventFromCheckbox) {
            return;
        }
        if (!this.cbSelectAllVisible) {
            return;
        }
        var value = this.cbSelectAll.getValue();
        if (value) {
            this.selectionController.selectAllRowNodes(this.filteredOnly);
        }
        else {
            this.selectionController.deselectAllRowNodes(this.filteredOnly);
        }
    };
    SelectAllFeature.prototype.isCheckboxSelection = function () {
        var result = this.column.getColDef().headerCheckboxSelection;
        if (typeof result === 'function') {
            var func = result;
            result = func({
                column: this.column,
                colDef: this.column.getColDef(),
                columnApi: this.columnApi,
                api: this.gridApi
            });
        }
        if (result) {
            if (this.gridOptionsWrapper.isRowModelServerSide()) {
                console.warn('headerCheckboxSelection is not supported for Server Side Row Model');
                return false;
            }
            if (this.gridOptionsWrapper.isRowModelInfinite()) {
                console.warn('headerCheckboxSelection is not supported for Infinite Row Model');
                return false;
            }
            if (this.gridOptionsWrapper.isRowModelViewport()) {
                console.warn('headerCheckboxSelection is not supported for Viewport Row Model');
                return false;
            }
            // otherwise the row model is compatible, so return true
            return true;
        }
        return false;
    };
    __decorate([
        Autowired('gridApi')
    ], SelectAllFeature.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], SelectAllFeature.prototype, "columnApi", void 0);
    __decorate([
        Autowired('rowModel')
    ], SelectAllFeature.prototype, "rowModel", void 0);
    __decorate([
        Autowired('selectionController')
    ], SelectAllFeature.prototype, "selectionController", void 0);
    __decorate([
        PostConstruct
    ], SelectAllFeature.prototype, "postConstruct", null);
    return SelectAllFeature;
}(BeanStub));
export { SelectAllFeature };
