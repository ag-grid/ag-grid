// ag-grid-enterprise v8.0.0
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var RenderedColumn = (function (_super) {
    __extends(RenderedColumn, _super);
    function RenderedColumn(column, columnDept, allowDragging) {
        _super.call(this);
        this.processingColumnStateChange = false;
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }
    RenderedColumn.prototype.init = function () {
        this.setTemplate(RenderedColumn.TEMPLATE);
        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
        this.eText.innerHTML = this.displayName;
        this.eIndent.style.width = (this.columnDept * 10) + 'px';
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
    RenderedColumn.prototype.addTap = function () {
        var touchListener = new main_1.TouchListener(this.getGui());
        this.addDestroyableEventListener(touchListener, main_1.TouchListener.EVENT_TAP, this.onClick.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    RenderedColumn.prototype.onClick = function () {
        if (this.cbSelect.isReadOnly()) {
            return;
        }
        this.cbSelect.toggle();
    };
    RenderedColumn.prototype.onChange = function (event) {
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
            this.columnController.setColumnVisible(this.column, event.selected);
        }
    };
    RenderedColumn.prototype.actionUnCheckedPivotMode = function () {
        var functionPassive = this.gridOptionsWrapper.isFunctionsPassive();
        var column = this.column;
        var columnController = this.columnController;
        // remove pivot if column is pivoted
        if (column.isPivotActive()) {
            if (functionPassive) {
                var copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                copyOfPivotColumns.push(column);
                this.eventService.dispatchEvent(main_1.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST, { columns: copyOfPivotColumns });
            }
            else {
                columnController.removePivotColumn(column);
            }
        }
        // remove value if column is value
        if (column.isValueActive()) {
            if (functionPassive) {
                var copyOfValueColumns = this.columnController.getValueColumns().slice();
                copyOfValueColumns.push(column);
                this.eventService.dispatchEvent(main_1.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST, { columns: copyOfValueColumns });
            }
            else {
                columnController.removeValueColumn(column);
            }
        }
        // remove group if column is grouped
        if (column.isRowGroupActive()) {
            if (functionPassive) {
                var copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                copyOfRowGroupColumns.push(column);
                this.eventService.dispatchEvent(main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST, { columns: copyOfRowGroupColumns });
            }
            else {
                columnController.removeRowGroupColumn(column);
            }
        }
    };
    RenderedColumn.prototype.actionCheckedPivotMode = function () {
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
                this.eventService.dispatchEvent(main_1.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST, { columns: copyOfValueColumns });
            }
            else {
                this.columnController.addValueColumn(column);
            }
        }
        else if (column.isAllowRowGroup()) {
            if (functionPassive) {
                var copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                main_1.Utils.removeFromArray(copyOfRowGroupColumns, column);
                this.eventService.dispatchEvent(main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST, { columns: copyOfRowGroupColumns });
            }
            else {
                this.columnController.addRowGroupColumn(column);
            }
        }
        else if (column.isAllowPivot()) {
            if (functionPassive) {
                var copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                main_1.Utils.removeFromArray(copyOfPivotColumns, column);
                this.eventService.dispatchEvent(main_1.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST, { columns: copyOfPivotColumns });
            }
            else {
                this.columnController.addPivotColumn(column);
            }
        }
    };
    RenderedColumn.prototype.addDragSource = function () {
        var _this = this;
        var dragSource = {
            type: main_1.DragSourceType.ToolPanel,
            eElement: this.getGui(),
            dragItemName: this.displayName,
            dragItem: [this.column]
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    RenderedColumn.prototype.onColumnStateChanged = function () {
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
        // read only in pivot mode if:
        var checkboxReadOnly = isPivotMode
            && (this.gridOptionsWrapper.isFunctionsReadOnly()
                || !this.column.isAnyFunctionAllowed());
        this.cbSelect.setReadOnly(checkboxReadOnly);
        var checkboxPassive = isPivotMode && this.gridOptionsWrapper.isFunctionsPassive();
        this.cbSelect.setPassive(checkboxPassive);
        this.processingColumnStateChange = false;
    };
    RenderedColumn.TEMPLATE = '<div class="ag-column-select-column">' +
        '<span class="ag-column-select-indent"></span>' +
        '<ag-checkbox class="ag-column-select-checkbox"></ag-checkbox>' +
        '<span class="ag-column-select-label"></span>' +
        '</div>';
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], RenderedColumn.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], RenderedColumn.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'), 
        __metadata('design:type', main_1.EventService)
    ], RenderedColumn.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('dragAndDropService'), 
        __metadata('design:type', main_1.DragAndDropService)
    ], RenderedColumn.prototype, "dragAndDropService", void 0);
    __decorate([
        main_1.Autowired('gridPanel'), 
        __metadata('design:type', main_1.GridPanel)
    ], RenderedColumn.prototype, "gridPanel", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], RenderedColumn.prototype, "context", void 0);
    __decorate([
        main_1.QuerySelector('.ag-column-select-label'), 
        __metadata('design:type', HTMLElement)
    ], RenderedColumn.prototype, "eText", void 0);
    __decorate([
        main_1.QuerySelector('.ag-column-select-indent'), 
        __metadata('design:type', HTMLElement)
    ], RenderedColumn.prototype, "eIndent", void 0);
    __decorate([
        main_1.QuerySelector('.ag-column-select-checkbox'), 
        __metadata('design:type', main_1.AgCheckbox)
    ], RenderedColumn.prototype, "cbSelect", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedColumn.prototype, "init", null);
    return RenderedColumn;
}(main_1.Component));
exports.RenderedColumn = RenderedColumn;
