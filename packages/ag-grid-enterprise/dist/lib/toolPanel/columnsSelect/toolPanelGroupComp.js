// ag-grid-enterprise v18.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var ToolPanelGroupComp = (function (_super) {
    __extends(ToolPanelGroupComp, _super);
    function ToolPanelGroupComp(columnGroup, columnDept, expandedCallback, allowDragging, expandByDefault) {
        var _this = _super.call(this) || this;
        _this.processingColumnStateChange = false;
        _this.columnGroup = columnGroup;
        _this.columnDept = columnDept;
        _this.expandedCallback = expandedCallback;
        _this.allowDragging = allowDragging;
        _this.expanded = expandByDefault;
        return _this;
    }
    ToolPanelGroupComp.prototype.init = function () {
        this.setTemplate(ToolPanelGroupComp.TEMPLATE);
        this.instantiate(this.context);
        var eText = this.queryForHtmlElement('#eText');
        // this.displayName = this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : null;
        this.displayName = this.columnController.getDisplayNameForOriginalColumnGroup(null, this.columnGroup, 'toolPanel');
        if (main_1.Utils.missing(this.displayName)) {
            this.displayName = '>>';
        }
        eText.innerHTML = this.displayName;
        this.setupExpandContract();
        this.addCssClass('ag-toolpanel-indent-' + this.columnDept);
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.setOpenClosedIcons();
        this.setupDragging();
        this.onColumnStateChanged();
        this.addVisibilityListenersToAllChildren();
        main_1.CssClassApplier.addToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);
    };
    ToolPanelGroupComp.prototype.addVisibilityListenersToAllChildren = function () {
        var _this = this;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_VISIBLE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_VALUE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_PIVOT_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_ROW_GROUP_CHANGED, _this.onColumnStateChanged.bind(_this));
        });
    };
    ToolPanelGroupComp.prototype.setupDragging = function () {
        var _this = this;
        if (!this.allowDragging) {
            main_1._.setVisible(this.eDragHandle, false);
            return;
        }
        var dragSource = {
            type: main_1.DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            dragItemCallback: function () { return _this.createDragItem(); }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    ToolPanelGroupComp.prototype.createDragItem = function () {
        var visibleState = {};
        this.columnGroup.getLeafColumns().forEach(function (col) {
            visibleState[col.getId()] = col.isVisible();
        });
        return {
            columns: this.columnGroup.getLeafColumns(),
            visibleState: visibleState
        };
    };
    ToolPanelGroupComp.prototype.setupExpandContract = function () {
        this.eGroupClosedIcon = this.queryForHtmlElement('#eGroupClosedIcon');
        this.eGroupOpenedIcon = this.queryForHtmlElement('#eGroupOpenedIcon');
        this.eGroupClosedIcon.appendChild(main_1.Utils.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(main_1.Utils.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));
        this.addDestroyableEventListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addDestroyableEventListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        var eColumnGroupIcons = this.queryForHtmlElement('#eColumnGroupIcons');
        var touchListener = new main_1.TouchListener(eColumnGroupIcons, true);
        this.addDestroyableEventListener(touchListener, main_1.TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    ToolPanelGroupComp.prototype.onLabelClicked = function () {
        var nextState = !this.cbSelect.isSelected();
        this.onChangeCommon(nextState);
    };
    ToolPanelGroupComp.prototype.onCheckboxChanged = function (event) {
        this.onChangeCommon(event.selected);
    };
    ToolPanelGroupComp.prototype.onChangeCommon = function (nextState) {
        if (this.processingColumnStateChange) {
            return;
        }
        var childColumns = this.columnGroup.getLeafColumns();
        if (this.columnController.isPivotMode()) {
            if (nextState) {
                this.actionCheckedReduce(childColumns);
            }
            else {
                this.actionUnCheckedReduce(childColumns);
            }
        }
        else {
            var allowedColumns = childColumns.filter(function (c) { return !c.isLockVisible(); });
            this.columnController.setColumnsVisible(allowedColumns, nextState, "toolPanelUi");
        }
        if (this.selectionCallback) {
            this.selectionCallback(this.isSelected());
        }
    };
    ToolPanelGroupComp.prototype.actionUnCheckedReduce = function (columns) {
        var columnsToUnPivot = [];
        var columnsToUnValue = [];
        var columnsToUnGroup = [];
        columns.forEach(function (column) {
            if (column.isPivotActive()) {
                columnsToUnPivot.push(column);
            }
            if (column.isRowGroupActive()) {
                columnsToUnGroup.push(column);
            }
            if (column.isValueActive()) {
                columnsToUnValue.push(column);
            }
        });
        if (columnsToUnPivot.length > 0) {
            this.columnController.removePivotColumns(columnsToUnPivot, "toolPanelUi");
        }
        if (columnsToUnGroup.length > 0) {
            this.columnController.removeRowGroupColumns(columnsToUnGroup, "toolPanelUi");
        }
        if (columnsToUnValue.length > 0) {
            this.columnController.removeValueColumns(columnsToUnValue, "toolPanelUi");
        }
    };
    ToolPanelGroupComp.prototype.actionCheckedReduce = function (columns) {
        var columnsToAggregate = [];
        var columnsToGroup = [];
        var columnsToPivot = [];
        columns.forEach(function (column) {
            // don't change any column that's already got a function active
            if (column.isAnyFunctionActive()) {
                return;
            }
            if (column.isAllowValue()) {
                columnsToAggregate.push(column);
            }
            else if (column.isAllowRowGroup()) {
                columnsToGroup.push(column);
            }
            else if (column.isAllowRowGroup()) {
                columnsToPivot.push(column);
            }
        });
        if (columnsToAggregate.length > 0) {
            this.columnController.addValueColumns(columnsToAggregate, "toolPanelUi");
        }
        if (columnsToGroup.length > 0) {
            this.columnController.addRowGroupColumns(columnsToGroup, "toolPanelUi");
        }
        if (columnsToPivot.length > 0) {
            this.columnController.addPivotColumns(columnsToPivot, "toolPanelUi");
        }
    };
    ToolPanelGroupComp.prototype.onColumnStateChanged = function () {
        var selectedValue = this.workOutSelectedValue();
        var readOnlyValue = this.workOutReadOnlyValue();
        this.processingColumnStateChange = true;
        this.cbSelect.setSelected(selectedValue);
        if (this.selectionCallback) {
            this.selectionCallback(this.isSelected());
        }
        this.cbSelect.setReadOnly(readOnlyValue);
        this.processingColumnStateChange = false;
    };
    ToolPanelGroupComp.prototype.workOutReadOnlyValue = function () {
        var pivotMode = this.columnController.isPivotMode();
        var colsThatCanAction = 0;
        this.columnGroup.getLeafColumns().forEach(function (col) {
            if (pivotMode) {
                if (col.isAnyFunctionAllowed()) {
                    colsThatCanAction++;
                }
            }
            else {
                if (!col.isLockVisible()) {
                    colsThatCanAction++;
                }
            }
        });
        return colsThatCanAction === 0;
    };
    ToolPanelGroupComp.prototype.workOutSelectedValue = function () {
        var _this = this;
        var pivotMode = this.columnController.isPivotMode();
        var visibleChildCount = 0;
        var hiddenChildCount = 0;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            if (_this.isColumnVisible(column, pivotMode)) {
                visibleChildCount++;
            }
            else {
                hiddenChildCount++;
            }
        });
        var selectedValue;
        if (visibleChildCount > 0 && hiddenChildCount > 0) {
            selectedValue = null;
        }
        else if (visibleChildCount > 0) {
            selectedValue = true;
        }
        else {
            selectedValue = false;
        }
        return selectedValue;
    };
    ToolPanelGroupComp.prototype.isColumnVisible = function (column, pivotMode) {
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
    ToolPanelGroupComp.prototype.onExpandOrContractClicked = function () {
        this.expanded = !this.expanded;
        this.setOpenClosedIcons();
        this.expandedCallback();
    };
    ToolPanelGroupComp.prototype.setOpenClosedIcons = function () {
        var folderOpen = this.expanded;
        main_1.Utils.setVisible(this.eGroupClosedIcon, !folderOpen);
        main_1.Utils.setVisible(this.eGroupOpenedIcon, folderOpen);
    };
    ToolPanelGroupComp.prototype.isExpanded = function () {
        return this.expanded;
    };
    ToolPanelGroupComp.prototype.getDisplayName = function () {
        return this.displayName;
    };
    ToolPanelGroupComp.prototype.onSelectAllChanged = function (value) {
        if ((value && !this.cbSelect.isSelected()) ||
            (!value && this.cbSelect.isSelected())) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    };
    ToolPanelGroupComp.prototype.isSelected = function () {
        return this.cbSelect.isSelected();
    };
    ToolPanelGroupComp.prototype.isSelectable = function () {
        return !this.cbSelect.isReadOnly();
    };
    ToolPanelGroupComp.prototype.isExpandable = function () {
        return true;
    };
    ToolPanelGroupComp.prototype.setExpanded = function (value) {
        if (this.expanded !== value) {
            this.onExpandOrContractClicked();
        }
    };
    ToolPanelGroupComp.TEMPLATE = "<div class=\"ag-column-select-column-group\">\n            <span id=\"eColumnGroupIcons\" class=\"ag-column-group-icons\">\n                <span id=\"eGroupOpenedIcon\" class=\"ag-column-group-closed-icon\"></span>\n                <span id=\"eGroupClosedIcon\" class=\"ag-column-group-opened-icon\"></span>\n            </span>\n            <ag-checkbox ref=\"cbSelect\" (change)=\"onCheckboxChanged\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-drag\" ref=\"eDragHandle\"></span>\n            <span id=\"eText\" class=\"ag-column-select-column-group-label\" (click)=\"onLabelClicked\"></span>\n        </div>";
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ToolPanelGroupComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], ToolPanelGroupComp.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], ToolPanelGroupComp.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('dragAndDropService'),
        __metadata("design:type", main_1.DragAndDropService)
    ], ToolPanelGroupComp.prototype, "dragAndDropService", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], ToolPanelGroupComp.prototype, "eventService", void 0);
    __decorate([
        main_1.RefSelector('cbSelect'),
        __metadata("design:type", main_1.AgCheckbox)
    ], ToolPanelGroupComp.prototype, "cbSelect", void 0);
    __decorate([
        main_1.RefSelector('eDragHandle'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelGroupComp.prototype, "eDragHandle", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ToolPanelGroupComp.prototype, "init", null);
    return ToolPanelGroupComp;
}(main_1.Component));
exports.ToolPanelGroupComp = ToolPanelGroupComp;
