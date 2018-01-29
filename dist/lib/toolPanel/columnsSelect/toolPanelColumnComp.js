// ag-grid-enterprise v16.0.1
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
var ToolPanelColumnComp = (function (_super) {
    __extends(ToolPanelColumnComp, _super);
    function ToolPanelColumnComp(column, columnDept, allowDragging) {
        var _this = _super.call(this) || this;
        _this.processingColumnStateChange = false;
        _this.column = column;
        _this.columnDept = columnDept;
        _this.allowDragging = allowDragging;
        return _this;
    }
    ToolPanelColumnComp.prototype.init = function () {
        this.setTemplate(ToolPanelColumnComp.TEMPLATE);
        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
        this.eText.innerHTML = this.displayName;
        this.addCssClass('ag-toolpanel-indent-' + this.columnDept);
        if (this.allowDragging) {
            this.addDragSource();
        }
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, main_1.Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, main_1.Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, main_1.Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, main_1.Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));
        this.instantiate(this.context);
        this.onColumnStateChanged();
        this.addDestroyableEventListener(this.cbSelect, main_1.AgCheckbox.EVENT_CHANGED, this.onChange.bind(this));
        this.addDestroyableEventListener(this.eText, 'click', this.onClick.bind(this));
        this.addTap();
        main_1.CssClassApplier.addToolPanelClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    };
    ToolPanelColumnComp.prototype.addTap = function () {
        var touchListener = new main_1.TouchListener(this.getGui(), true);
        this.addDestroyableEventListener(touchListener, main_1.TouchListener.EVENT_TAP, this.onClick.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    ToolPanelColumnComp.prototype.onClick = function () {
        if (this.cbSelect.isReadOnly()) {
            return;
        }
        this.cbSelect.toggle();
    };
    ToolPanelColumnComp.prototype.onChange = function (event) {
        // only want to action if the user clicked the checkbox, not is we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) {
            return;
        }
        // action in a timeout, as the action takes some time, we want to update the icons first
        // so the user gets nice feedback when they click. otherwise there would be a lag and the
        // user would think the checkboxes were clunky
        if (this.columnController.isPivotMode()) {
            if (event.selected) {
                this.actionCheckedPivotMode();
            }
            else {
                this.actionUnCheckedPivotMode();
            }
        }
        else {
            this.columnController.setColumnVisible(this.column, event.selected, "columnMenu");
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
                main_1.Utils.removeFromArray(copyOfValueColumns, column);
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
                main_1.Utils.removeFromArray(copyOfRowGroupColumns, column);
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
                main_1.Utils.removeFromArray(copyOfPivotColumns, column);
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
    ToolPanelColumnComp.prototype.addDragSource = function () {
        var _this = this;
        var dragSource = {
            type: main_1.DragSourceType.ToolPanel,
            eElement: this.getGui(),
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
            this.cbSelect.setSelected(anyFunctionActive);
        }
        else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setSelected(this.column.isVisible());
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
            checkboxReadOnly = this.column.isLockVisible();
        }
        this.cbSelect.setReadOnly(checkboxReadOnly);
        var checkboxPassive = isPivotMode && this.gridOptionsWrapper.isFunctionsPassive();
        this.cbSelect.setPassive(checkboxPassive);
        this.processingColumnStateChange = false;
    };
    ToolPanelColumnComp.TEMPLATE = '<div class="ag-column-select-column">' +
        '<ag-checkbox class="ag-column-select-checkbox"></ag-checkbox>' +
        '<span class="ag-column-select-label"></span>' +
        '</div>';
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
        main_1.Autowired('gridPanel'),
        __metadata("design:type", main_1.GridPanel)
    ], ToolPanelColumnComp.prototype, "gridPanel", void 0);
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], ToolPanelColumnComp.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('columnApi'),
        __metadata("design:type", main_1.ColumnApi)
    ], ToolPanelColumnComp.prototype, "columnApi", void 0);
    __decorate([
        main_1.Autowired('gridApi'),
        __metadata("design:type", main_1.GridApi)
    ], ToolPanelColumnComp.prototype, "gridApi", void 0);
    __decorate([
        main_1.QuerySelector('.ag-column-select-label'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelColumnComp.prototype, "eText", void 0);
    __decorate([
        main_1.QuerySelector('.ag-column-select-indent'),
        __metadata("design:type", HTMLElement)
    ], ToolPanelColumnComp.prototype, "eIndent", void 0);
    __decorate([
        main_1.QuerySelector('.ag-column-select-checkbox'),
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
