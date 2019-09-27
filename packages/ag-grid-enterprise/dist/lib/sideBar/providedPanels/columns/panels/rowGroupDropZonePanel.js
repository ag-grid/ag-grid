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
var baseDropZonePanel_1 = require("../dropZone/baseDropZonePanel");
var RowGroupDropZonePanel = /** @class */ (function (_super) {
    __extends(RowGroupDropZonePanel, _super);
    function RowGroupDropZonePanel(horizontal) {
        return _super.call(this, horizontal, false, 'row-group') || this;
    }
    RowGroupDropZonePanel.prototype.passBeansUp = function () {
        _super.prototype.setBeans.call(this, {
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        var title = localeTextFunc('groups', 'Row Groups');
        _super.prototype.init.call(this, {
            dragAndDropIcon: main_1.DragAndDropService.ICON_GROUP,
            icon: main_1._.createIconNoSpan('rowGroupPanel', this.gridOptionsWrapper, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    };
    RowGroupDropZonePanel.prototype.isColumnDroppable = function (column) {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) {
            return false;
        }
        // we never allow grouping of secondary columns
        if (!column.isPrimary()) {
            return false;
        }
        var columnGroupable = column.isAllowRowGroup();
        var columnNotAlreadyGrouped = !column.isRowGroupActive();
        return columnGroupable && columnNotAlreadyGrouped;
    };
    RowGroupDropZonePanel.prototype.updateColumns = function (columns) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            var event_1 = {
                type: main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: columns,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
        }
        else {
            this.columnController.setRowGroupColumns(columns, "toolPanelUi");
        }
    };
    RowGroupDropZonePanel.prototype.getIconName = function () {
        return this.isPotentialDndColumns() ? main_1.DragAndDropService.ICON_GROUP : main_1.DragAndDropService.ICON_NOT_ALLOWED;
    };
    RowGroupDropZonePanel.prototype.getExistingColumns = function () {
        return this.columnController.getRowGroupColumns();
    };
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], RowGroupDropZonePanel.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], RowGroupDropZonePanel.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], RowGroupDropZonePanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('loggerFactory'),
        __metadata("design:type", main_1.LoggerFactory)
    ], RowGroupDropZonePanel.prototype, "loggerFactory", void 0);
    __decorate([
        main_1.Autowired('dragAndDropService'),
        __metadata("design:type", main_1.DragAndDropService)
    ], RowGroupDropZonePanel.prototype, "dragAndDropService", void 0);
    __decorate([
        main_1.Autowired('columnApi'),
        __metadata("design:type", main_1.ColumnApi)
    ], RowGroupDropZonePanel.prototype, "columnApi", void 0);
    __decorate([
        main_1.Autowired('gridApi'),
        __metadata("design:type", main_1.GridApi)
    ], RowGroupDropZonePanel.prototype, "gridApi", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RowGroupDropZonePanel.prototype, "passBeansUp", null);
    return RowGroupDropZonePanel;
}(baseDropZonePanel_1.BaseDropZonePanel));
exports.RowGroupDropZonePanel = RowGroupDropZonePanel;
