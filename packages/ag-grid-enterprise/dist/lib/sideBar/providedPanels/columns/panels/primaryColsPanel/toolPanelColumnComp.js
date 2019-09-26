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
var ToolPanelColumnComp = /** @class */ (function (_super) {
    __extends(ToolPanelColumnComp, _super);
    function ToolPanelColumnComp(column, columnDept, allowDragging, groupsExist) {
        var _this = _super.call(this) || this;
        _this.processingColumnStateChange = false;
        _this.column = column;
        _this.columnDept = columnDept;
        _this.allowDragging = allowDragging;
        _this.groupsExist = groupsExist;
        return _this;
    }
    ToolPanelColumnComp.prototype.init = function () {
        this.setTemplate(ToolPanelColumnComp.TEMPLATE);
        this.eDragHandle = main_1._.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        main_1._.addCssClass(this.eDragHandle, 'ag-column-drag');
        this.cbSelect.getGui().insertAdjacentElement('afterend', this.eDragHandle);
        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
        var displayNameSanitised = main_1._.escape(this.displayName);
        this.eLabel.innerHTML = displayNameSanitised;
        // if grouping, we add an extra level of indent, to cater for expand/contract icons we need to indent for
        var indent = this.columnDept;
        if (this.groupsExist) {
            this.addCssClass('ag-toolpanel-add-group-indent');
        }
        this.addCssClass("ag-toolpanel-indent-" + indent);
        this.setupDragging();
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, main_1.Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, main_1.Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, main_1.Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, main_1.Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.cbSelect, main_1.AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addDestroyableEventListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.onColumnStateChanged();
        main_1.CssClassApplier.addToolPanelClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    };
    ToolPanelColumnComp.prototype.onLabelClicked = function () {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) {
            return;
        }
        var nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    };
    ToolPanelColumnComp.prototype.onCheckboxChanged = function (event) {
        this.onChangeCommon(event.selected);
    };
    ToolPanelColumnComp.prototype.onChangeCommon = function (nextState) {
        // ignore lock visible columns
        if (this.column.getColDef().lockVisible) {
            return;
        }
        // only want to action if the user clicked the checkbox, not is we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) {
            return;
        }
        // action in a timeout, as the action takes some time, we want to update the icons first
        // so the user gets nice feedback when they click. otherwise there would be a lag and the
        // user would think the checkboxes were clunky
        if (this.columnController.isPivotMode()) {
            if (nextState) {
                this.actionCheckedPivotMode();
            }
            else {
                this.actionUnCheckedPivotMode();
            }
        }
        else {
            this.columnController.setColumnVisible(this.column, nextState, "columnMenu");
        }
        if (this.selectionCallback) {
            this.selectionCallback(this.isSelected());
        }
    };
    ToolPanelColumnComp.prototype.actionUnCheckedPivotMode = function () {
        var functionPassive = this.gridOptionsWrapper.isFunctionsPassive();
        var column = this.column;
        var columnController = this.columnController;
        // remove pivot if column is pivoted
        if (column.isPivotActive()) {
            if (functionPassive) {
                var copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                copyOfPivotColumns.push(column);
                var event_1 = {
                    type: main_1.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                    columns: copyOfPivotColumns,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event_1);
            }
            else {
                columnController.removePivotColumn(column, "columnMenu");
            }
        }
        // remove value if column is value
        if (column.isValueActive()) {
            if (functionPassive) {
                var copyOfValueColumns = this.columnController.getValueColumns().slice();
                copyOfValueColumns.push(column);
                var event_2 = {
                    type: main_1.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                    columns: copyOfValueColumns,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event_2);
            }
            else {
                columnController.removeValueColumn(column, "columnMenu");
            }
        }
        // remove group if column is grouped
        if (column.isRowGroupActive()) {
            if (functionPassive) {
                var copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                copyOfRowGroupColumns.push(column);
                var event_3 = {
                    type: main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                    columns: copyOfRowGroupColumns,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event_3);
            }
            else {
                columnController.removeRowGroupColumn(column, "columnMenu");
            }
        }
    };
    ToolPanelColumnComp.prototype.actionCheckedPivotMode = function () {
        var column = this.column;
        // function already active, so do nothing
        if (column.isValueActive() || column.isPivotActive() || column.isRowGroupActive()) {
            return;
        }
        var functionPassive = this.gridOptionsWrapper.isFunctionsPassive();
        if (column.isAllowValue()) {
            if (functionPassive) {
                var copyOfValueColumns = this.columnController.getValueColumns().slice();
                main_1._.removeFromArray(copyOfValueColumns, column);
                var event_4 = {
                    type: main_1.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    columns: copyOfValueColumns
                };
                this.eventService.dispatchEvent(event_4);
            }
            else {
                this.columnController.addValueColumn(column, "columnMenu");
            }
        }
        else if (column.isAllowRowGroup()) {
            if (functionPassive) {
                var copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                main_1._.removeFromArray(copyOfRowGroupColumns, column);
                var event_5 = {
                    type: main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    columns: copyOfRowGroupColumns
                };
                this.eventService.dispatchEvent(event_5);
            }
            else {
                this.columnController.addRowGroupColumn(column, "columnMenu");
            }
        }
        else if (column.isAllowPivot()) {
            if (functionPassive) {
                var copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                main_1._.removeFromArray(copyOfPivotColumns, column);
                var event_6 = {
                    type: main_1.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    columns: copyOfPivotColumns
                };
                this.eventService.dispatchEvent(event_6);
            }
            else {
                this.columnController.addPivotColumn(column, "columnMenu");
            }
        }
    };
    ToolPanelColumnComp.prototype.setupDragging = function () {
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
    ToolPanelColumnComp.prototype.createDragItem = function () {
        var visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    };
    ToolPanelColumnComp.prototype.onColumnStateChanged = function () {
        this.processingColumnStateChange = true;
        var isPivotMode = this.columnController.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            var anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setValue(anyFunctionActive);
            if (this.selectionCallback) {
                this.selectionCallback(this.isSelected());
            }
        }
        else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setValue(this.column.isVisible());
            if (this.selectionCallback) {
                this.selectionCallback(this.isSelected());
            }
        }
        var checkboxReadOnly;
        if (isPivotMode) {
            // when in pivot mode, the item should be read only if:
            //  a) gui is not allowed make any changes
            var functionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
            //  b) column is not allow any functions on it
            var noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
            checkboxReadOnly = functionsReadOnly || noFunctionsAllowed;
        }
        else {
            // when in normal mode, the checkbox is read only if visibility is locked
            checkboxReadOnly = !!this.column.getColDef().lockVisible;
        }
        this.cbSelect.setReadOnly(checkboxReadOnly);
        var checkboxPassive = isPivotMode && this.gridOptionsWrapper.isFunctionsPassive();
        this.cbSelect.setPassive(checkboxPassive);
        this.processingColumnStateChange = false;
    };
    ToolPanelColumnComp.prototype.getDisplayName = function () {
        return this.displayName;
    };
    ToolPanelColumnComp.prototype.onSelectAllChanged = function (value) {
        if (value !== this.cbSelect.getValue()) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    };
    ToolPanelColumnComp.prototype.isSelected = function () {
        return this.cbSelect.getValue();
    };
    ToolPanelColumnComp.prototype.isSelectable = function () {
        return !this.cbSelect.isReadOnly();
    };
    ToolPanelColumnComp.prototype.isExpandable = function () {
        return false;
    };
    ToolPanelColumnComp.prototype.setExpanded = function (value) {
        console.warn('ag-grid: can not expand a column item that does not represent a column group header');
    };
    ToolPanelColumnComp.TEMPLATE = "<div class=\"ag-column-tool-panel-column\">\n            <ag-checkbox ref=\"cbSelect\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-tool-panel-column-label\" ref=\"eLabel\"></span>\n        </div>";
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ToolPanelColumnComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], ToolPanelColumnComp.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], ToolPanelColumnComp.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('dragAndDropService'),
        __metadata("design:type", main_1.DragAndDropService)
    ], ToolPanelColumnComp.prototype, "dragAndDropService", void 0);
    __decorate([
        main_1.Autowired('columnApi'),
        __metadata("design:type", main_1.ColumnApi)
    ], ToolPanelColumnComp.prototype, "columnApi", void 0);
    __decorate([
        main_1.Autowired('gridApi'),
        __metadata("design:type", main_1.GridApi)
    ], ToolPanelColumnComp.prototype, "gridApi", void 0);
    __decorate([
        main_1.RefSelector('eLabel'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelColumnComp.prototype, "eLabel", void 0);
    __decorate([
        main_1.RefSelector('cbSelect'),
        __metadata("design:type", main_1.AgCheckbox)
    ], ToolPanelColumnComp.prototype, "cbSelect", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ToolPanelColumnComp.prototype, "init", null);
    return ToolPanelColumnComp;
}(main_1.Component));
exports.ToolPanelColumnComp = ToolPanelColumnComp;
