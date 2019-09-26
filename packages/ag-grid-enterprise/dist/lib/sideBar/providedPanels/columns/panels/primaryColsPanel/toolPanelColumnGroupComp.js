// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid-community/main");
var ToolPanelColumnGroupComp = /** @class */ (function (_super) {
    __extends(ToolPanelColumnGroupComp, _super);
    function ToolPanelColumnGroupComp(columnGroup, columnDept, expandedCallback, allowDragging, expandByDefault) {
        var _this = _super.call(this) || this;
        _this.processingColumnStateChange = false;
        _this.columnGroup = columnGroup;
        _this.columnDept = columnDept;
        _this.expandedCallback = expandedCallback;
        _this.allowDragging = allowDragging;
        _this.expanded = expandByDefault;
        return _this;
    }
    ToolPanelColumnGroupComp.prototype.init = function () {
        this.setTemplate(ToolPanelColumnGroupComp.TEMPLATE);
        this.eDragHandle = main_1._.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        main_1._.addCssClass(this.eDragHandle, 'ag-column-drag');
        this.cbSelect.getGui().insertAdjacentElement('afterend', this.eDragHandle);
        // this.displayName = this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : null;
        this.displayName = this.columnController.getDisplayNameForOriginalColumnGroup(null, this.columnGroup, 'toolPanel');
        if (main_1._.missing(this.displayName)) {
            this.displayName = '>>';
        }
        this.eLabel.innerHTML = this.displayName ? this.displayName : '';
        this.setupExpandContract();
        this.addCssClass('ag-toolpanel-indent-' + this.columnDept);
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.addDestroyableEventListener(this.cbSelect, main_1.AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.setOpenClosedIcons();
        this.setupDragging();
        this.onColumnStateChanged();
        this.addVisibilityListenersToAllChildren();
        main_1.CssClassApplier.addToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);
    };
    ToolPanelColumnGroupComp.prototype.addVisibilityListenersToAllChildren = function () {
        var _this = this;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_VISIBLE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_VALUE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_PIVOT_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addDestroyableEventListener(column, main_1.Column.EVENT_ROW_GROUP_CHANGED, _this.onColumnStateChanged.bind(_this));
        });
    };
    ToolPanelColumnGroupComp.prototype.setupDragging = function () {
        var _this = this;
        if (!this.allowDragging) {
            main_1._.setDisplayed(this.eDragHandle, false);
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
        this.eGroupClosedIcon.appendChild(main_1._.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(main_1._.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));
        this.addDestroyableEventListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addDestroyableEventListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        var touchListener = new main_1.TouchListener(this.eColumnGroupIcons, true);
        this.addDestroyableEventListener(touchListener, main_1.TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    ToolPanelColumnGroupComp.prototype.onLabelClicked = function () {
        var nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    };
    ToolPanelColumnGroupComp.prototype.onCheckboxChanged = function (event) {
        this.onChangeCommon(event.selected);
    };
    ToolPanelColumnGroupComp.prototype.onChangeCommon = function (nextState) {
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
            var isAllowedColumn = function (c) { return !c.getColDef().lockVisible && !c.getColDef().suppressToolPanel; };
            var allowedColumns = childColumns.filter(isAllowedColumn);
            this.columnController.setColumnsVisible(allowedColumns, nextState, "toolPanelUi");
        }
        if (this.selectionCallback) {
            this.selectionCallback(this.isSelected());
        }
    };
    ToolPanelColumnGroupComp.prototype.actionUnCheckedReduce = function (columns) {
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
    ToolPanelColumnGroupComp.prototype.actionCheckedReduce = function (columns) {
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
    ToolPanelColumnGroupComp.prototype.onColumnStateChanged = function () {
        var selectedValue = this.workOutSelectedValue();
        var readOnlyValue = this.workOutReadOnlyValue();
        this.processingColumnStateChange = true;
        this.cbSelect.setValue(selectedValue);
        if (this.selectionCallback) {
            this.selectionCallback(this.isSelected());
        }
        this.cbSelect.setReadOnly(readOnlyValue);
        this.processingColumnStateChange = false;
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
    ToolPanelColumnGroupComp.prototype.workOutSelectedValue = function () {
        var pivotMode = this.columnController.isPivotMode();
        var leafColumns = this.columnGroup.getLeafColumns();
        var len = leafColumns.length;
        var count = { visible: 0, hidden: 0 };
        var ignoredChildCount = { visible: 0, hidden: 0 };
        for (var i = 0; i < len; i++) {
            var column = leafColumns[i];
            // ignore lock visible columns and columns set to 'suppressToolPanel'
            var ignore = column.getColDef().lockVisible || column.getColDef().suppressToolPanel;
            var type = this.isColumnVisible(column, pivotMode) ? 'visible' : 'hidden';
            count[type]++;
            if (!ignore) {
                continue;
            }
            ignoredChildCount[type]++;
        }
        // if all columns are ignored we use the regular count, if not
        // we only consider the columns that were not ignored
        if (ignoredChildCount.visible + ignoredChildCount.hidden !== len) {
            count.visible -= ignoredChildCount.visible;
            count.hidden -= ignoredChildCount.hidden;
        }
        var selectedValue;
        if (count.visible > 0 && count.hidden > 0) {
            selectedValue = null;
        }
        else if (count.visible > 0) {
            selectedValue = true;
        }
        else {
            selectedValue = false;
        }
        return selectedValue == null ? undefined : selectedValue;
    };
    ToolPanelColumnGroupComp.prototype.isColumnVisible = function (column, pivotMode) {
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
        this.expanded = !this.expanded;
        this.setOpenClosedIcons();
        this.expandedCallback();
    };
    ToolPanelColumnGroupComp.prototype.setOpenClosedIcons = function () {
        var folderOpen = this.expanded;
        main_1._.setDisplayed(this.eGroupClosedIcon, !folderOpen);
        main_1._.setDisplayed(this.eGroupOpenedIcon, folderOpen);
    };
    ToolPanelColumnGroupComp.prototype.isExpanded = function () {
        return this.expanded;
    };
    ToolPanelColumnGroupComp.prototype.getDisplayName = function () {
        return this.displayName;
    };
    ToolPanelColumnGroupComp.prototype.onSelectAllChanged = function (value) {
        if ((value && !this.cbSelect.getValue()) ||
            (!value && this.cbSelect.getValue())) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    };
    ToolPanelColumnGroupComp.prototype.isSelected = function () {
        return this.cbSelect.getValue();
    };
    ToolPanelColumnGroupComp.prototype.isSelectable = function () {
        return !this.cbSelect.isReadOnly();
    };
    ToolPanelColumnGroupComp.prototype.isExpandable = function () {
        return true;
    };
    ToolPanelColumnGroupComp.prototype.setExpanded = function (value) {
        if (this.expanded !== value) {
            this.onExpandOrContractClicked();
        }
    };
    ToolPanelColumnGroupComp.TEMPLATE = "<div class=\"ag-column-tool-panel-column-group\">\n            <span class=\"ag-column-group-icons\" ref=\"eColumnGroupIcons\" >\n                <span class=\"ag-column-group-closed-icon\" ref=\"eGroupOpenedIcon\"></span>\n                <span class=\"ag-column-group-opened-icon\" ref=\"eGroupClosedIcon\"></span>\n            </span>\n            <ag-checkbox ref=\"cbSelect\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-tool-panel-column-label\" ref=\"eLabel\"></span>\n        </div>";
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ToolPanelColumnGroupComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], ToolPanelColumnGroupComp.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('dragAndDropService'),
        __metadata("design:type", main_1.DragAndDropService)
    ], ToolPanelColumnGroupComp.prototype, "dragAndDropService", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], ToolPanelColumnGroupComp.prototype, "eventService", void 0);
    __decorate([
        main_1.RefSelector('cbSelect'),
        __metadata("design:type", main_1.AgCheckbox)
    ], ToolPanelColumnGroupComp.prototype, "cbSelect", void 0);
    __decorate([
        main_1.RefSelector('eLabel'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelColumnGroupComp.prototype, "eLabel", void 0);
    __decorate([
        main_1.RefSelector('eGroupOpenedIcon'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelColumnGroupComp.prototype, "eGroupOpenedIcon", void 0);
    __decorate([
        main_1.RefSelector('eGroupClosedIcon'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelColumnGroupComp.prototype, "eGroupClosedIcon", void 0);
    __decorate([
        main_1.RefSelector('eColumnGroupIcons'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelColumnGroupComp.prototype, "eColumnGroupIcons", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ToolPanelColumnGroupComp.prototype, "init", null);
    return ToolPanelColumnGroupComp;
}(main_1.Component));
exports.ToolPanelColumnGroupComp = ToolPanelColumnGroupComp;
