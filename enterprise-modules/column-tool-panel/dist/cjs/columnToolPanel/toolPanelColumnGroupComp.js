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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var columnModelItem_1 = require("./columnModelItem");
var ToolPanelColumnGroupComp = /** @class */ (function (_super) {
    __extends(ToolPanelColumnGroupComp, _super);
    function ToolPanelColumnGroupComp(modelItem, allowDragging, eventType, focusWrapper) {
        var _this = _super.call(this) || this;
        _this.modelItem = modelItem;
        _this.allowDragging = allowDragging;
        _this.eventType = eventType;
        _this.focusWrapper = focusWrapper;
        _this.processingColumnStateChange = false;
        _this.modelItem = modelItem;
        _this.columnGroup = modelItem.getColumnGroup();
        _this.columnDept = modelItem.getDept();
        _this.allowDragging = allowDragging;
        return _this;
    }
    ToolPanelColumnGroupComp.prototype.init = function () {
        this.setTemplate(ToolPanelColumnGroupComp.TEMPLATE);
        this.eDragHandle = core_1._.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        core_1._.addCssClass(this.eDragHandle, 'ag-drag-handle');
        core_1._.addCssClass(this.eDragHandle, 'ag-column-select-column-group-drag-handle');
        this.cbSelect.getGui().insertAdjacentElement('afterend', this.eDragHandle);
        this.displayName = this.columnController.getDisplayNameForOriginalColumnGroup(null, this.columnGroup, this.eventType);
        if (core_1._.missing(this.displayName)) {
            this.displayName = '>>';
        }
        this.eLabel.innerHTML = this.displayName ? this.displayName : '';
        this.setupExpandContract();
        this.addCssClass('ag-column-select-indent-' + this.columnDept);
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.addManagedListener(this.cbSelect, core_1.AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.modelItem, columnModelItem_1.ColumnModelItem.EVENT_EXPANDED_CHANGED, this.onExpandChanged.bind(this));
        this.addManagedListener(this.focusWrapper, 'keydown', this.handleKeyDown.bind(this));
        this.setOpenClosedIcons();
        this.setupDragging();
        this.onColumnStateChanged();
        this.addVisibilityListenersToAllChildren();
        this.refreshAriaExpanded();
        this.refreshAriaLabel();
        core_1.CssClassApplier.addToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);
    };
    ToolPanelColumnGroupComp.prototype.handleKeyDown = function (e) {
        switch (e.keyCode) {
            case core_1.KeyCode.LEFT:
                e.preventDefault();
                this.modelItem.setExpanded(false);
                break;
            case core_1.KeyCode.RIGHT:
                e.preventDefault();
                this.modelItem.setExpanded(true);
                break;
            case core_1.KeyCode.SPACE:
                e.preventDefault();
                if (this.isSelectable()) {
                    this.onSelectAllChanged(!this.isSelected());
                }
                break;
        }
    };
    ToolPanelColumnGroupComp.prototype.addVisibilityListenersToAllChildren = function () {
        var _this = this;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            _this.addManagedListener(column, core_1.Column.EVENT_VISIBLE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, core_1.Column.EVENT_VALUE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, core_1.Column.EVENT_PIVOT_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, core_1.Column.EVENT_ROW_GROUP_CHANGED, _this.onColumnStateChanged.bind(_this));
        });
    };
    ToolPanelColumnGroupComp.prototype.setupDragging = function () {
        var _this = this;
        if (!this.allowDragging) {
            core_1._.setDisplayed(this.eDragHandle, false);
            return;
        }
        var dragSource = {
            type: core_1.DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            getDragItem: function () { return _this.createDragItem(); }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    ToolPanelColumnGroupComp.prototype.createDragItem = function () {
        var visibleState = {};
        this.columnGroup.getLeafColumns().forEach(function (col) {
            visibleState[col.getId()] = col.isVisible();
        });
        return {
            columns: this.columnGroup.getLeafColumns(),
            visibleState: visibleState
        };
    };
    ToolPanelColumnGroupComp.prototype.setupExpandContract = function () {
        this.eGroupClosedIcon.appendChild(core_1._.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(core_1._.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        var touchListener = new core_1.TouchListener(this.eColumnGroupIcons, true);
        this.addManagedListener(touchListener, core_1.TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    ToolPanelColumnGroupComp.prototype.onLabelClicked = function () {
        var nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    };
    ToolPanelColumnGroupComp.prototype.onCheckboxChanged = function (event) {
        this.onChangeCommon(event.selected);
    };
    ToolPanelColumnGroupComp.prototype.getVisibleLeafColumns = function () {
        var childColumns = [];
        var extractCols = function (children) {
            children.forEach(function (child) {
                if (!child.isPassesFilter()) {
                    return;
                }
                if (child.isGroup()) {
                    extractCols(child.getChildren());
                }
                else {
                    childColumns.push(child.getColumn());
                }
            });
        };
        extractCols(this.modelItem.getChildren());
        return childColumns;
    };
    ToolPanelColumnGroupComp.prototype.onChangeCommon = function (nextState) {
        this.refreshAriaLabel();
        if (this.processingColumnStateChange) {
            return;
        }
        this.modelItemUtils.selectAllChildren(this.modelItem.getChildren(), nextState, this.eventType);
    };
    ToolPanelColumnGroupComp.prototype.refreshAriaLabel = function () {
        var state = this.cbSelect.getValue() ? 'visible' : 'hidden';
        core_1._.setAriaLabel(this.focusWrapper, this.displayName + " column group toggle visibility (" + state + ")");
    };
    ToolPanelColumnGroupComp.prototype.onColumnStateChanged = function () {
        var selectedValue = this.workOutSelectedValue();
        var readOnlyValue = this.workOutReadOnlyValue();
        this.processingColumnStateChange = true;
        this.cbSelect.setValue(selectedValue);
        this.cbSelect.setReadOnly(readOnlyValue);
        core_1._.addOrRemoveCssClass(this.getGui(), 'ag-column-select-column-group-readonly', readOnlyValue);
        this.processingColumnStateChange = false;
    };
    ToolPanelColumnGroupComp.prototype.workOutSelectedValue = function () {
        var _this = this;
        var pivotMode = this.columnController.isPivotMode();
        var visibleLeafColumns = this.getVisibleLeafColumns();
        var checkedCount = 0;
        var uncheckedCount = 0;
        visibleLeafColumns.forEach(function (column) {
            if (!pivotMode && column.getColDef().lockVisible) {
                return;
            }
            if (_this.isColumnChecked(column, pivotMode)) {
                checkedCount++;
            }
            else {
                uncheckedCount++;
            }
        });
        if (checkedCount > 0 && uncheckedCount > 0) {
            return undefined;
        }
        else {
            return checkedCount > 0;
        }
    };
    ToolPanelColumnGroupComp.prototype.workOutReadOnlyValue = function () {
        var pivotMode = this.columnController.isPivotMode();
        var colsThatCanAction = 0;
        this.columnGroup.getLeafColumns().forEach(function (col) {
            if (pivotMode) {
                if (col.isAnyFunctionAllowed()) {
                    colsThatCanAction++;
                }
            }
            else {
                if (!col.getColDef().lockVisible) {
                    colsThatCanAction++;
                }
            }
        });
        return colsThatCanAction === 0;
    };
    ToolPanelColumnGroupComp.prototype.isColumnChecked = function (column, pivotMode) {
        if (pivotMode) {
            var pivoted = column.isPivotActive();
            var grouped = column.isRowGroupActive();
            var aggregated = column.isValueActive();
            return pivoted || grouped || aggregated;
        }
        else {
            return column.isVisible();
        }
    };
    ToolPanelColumnGroupComp.prototype.onExpandOrContractClicked = function () {
        var oldState = this.modelItem.isExpanded();
        this.modelItem.setExpanded(!oldState);
    };
    ToolPanelColumnGroupComp.prototype.onExpandChanged = function () {
        this.setOpenClosedIcons();
        this.refreshAriaExpanded();
    };
    ToolPanelColumnGroupComp.prototype.setOpenClosedIcons = function () {
        var folderOpen = this.modelItem.isExpanded();
        core_1._.setDisplayed(this.eGroupClosedIcon, !folderOpen);
        core_1._.setDisplayed(this.eGroupOpenedIcon, folderOpen);
    };
    ToolPanelColumnGroupComp.prototype.refreshAriaExpanded = function () {
        core_1._.setAriaExpanded(this.focusWrapper, this.modelItem.isExpanded());
    };
    ToolPanelColumnGroupComp.prototype.getDisplayName = function () {
        return this.displayName;
    };
    ToolPanelColumnGroupComp.prototype.onSelectAllChanged = function (value) {
        var cbValue = this.cbSelect.getValue();
        var readOnly = this.cbSelect.isReadOnly();
        if (!readOnly && ((value && !cbValue) || (!value && cbValue))) {
            this.cbSelect.toggle();
        }
    };
    ToolPanelColumnGroupComp.prototype.isSelected = function () {
        return this.cbSelect.getValue();
    };
    ToolPanelColumnGroupComp.prototype.isSelectable = function () {
        return !this.cbSelect.isReadOnly();
    };
    ToolPanelColumnGroupComp.prototype.setSelected = function (selected) {
        this.cbSelect.setValue(selected, true);
    };
    ToolPanelColumnGroupComp.TEMPLATE = "<div class=\"ag-column-select-column-group\" aria-hidden=\"true\">\n            <span class=\"ag-column-group-icons\" ref=\"eColumnGroupIcons\" >\n                <span class=\"ag-column-group-closed-icon\" ref=\"eGroupClosedIcon\"></span>\n                <span class=\"ag-column-group-opened-icon\" ref=\"eGroupOpenedIcon\"></span>\n            </span>\n            <ag-checkbox ref=\"cbSelect\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-select-column-label\" ref=\"eLabel\"></span>\n        </div>";
    __decorate([
        core_1.Autowired('columnController')
    ], ToolPanelColumnGroupComp.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('dragAndDropService')
    ], ToolPanelColumnGroupComp.prototype, "dragAndDropService", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], ToolPanelColumnGroupComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('modelItemUtils')
    ], ToolPanelColumnGroupComp.prototype, "modelItemUtils", void 0);
    __decorate([
        core_1.RefSelector('cbSelect')
    ], ToolPanelColumnGroupComp.prototype, "cbSelect", void 0);
    __decorate([
        core_1.RefSelector('eLabel')
    ], ToolPanelColumnGroupComp.prototype, "eLabel", void 0);
    __decorate([
        core_1.RefSelector('eGroupOpenedIcon')
    ], ToolPanelColumnGroupComp.prototype, "eGroupOpenedIcon", void 0);
    __decorate([
        core_1.RefSelector('eGroupClosedIcon')
    ], ToolPanelColumnGroupComp.prototype, "eGroupClosedIcon", void 0);
    __decorate([
        core_1.RefSelector('eColumnGroupIcons')
    ], ToolPanelColumnGroupComp.prototype, "eColumnGroupIcons", void 0);
    __decorate([
        core_1.PostConstruct
    ], ToolPanelColumnGroupComp.prototype, "init", null);
    return ToolPanelColumnGroupComp;
}(core_1.Component));
exports.ToolPanelColumnGroupComp = ToolPanelColumnGroupComp;
//# sourceMappingURL=toolPanelColumnGroupComp.js.map