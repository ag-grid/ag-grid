/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
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
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var changedPath_1 = require("../rowModels/clientSide/changedPath");
var rowRenderer_1 = require("../rendering/rowRenderer");
var eventService_1 = require("../eventService");
var constants_1 = require("../constants");
var beanStub_1 = require("../context/beanStub");
var events_1 = require("../events");
var ChangeDetectionService = /** @class */ (function (_super) {
    __extends(ChangeDetectionService, _super);
    function ChangeDetectionService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChangeDetectionService.prototype.init = function () {
        if (this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged.bind(this));
    };
    ChangeDetectionService.prototype.onCellValueChanged = function (event) {
        this.doChangeDetection(event.node, event.column);
    };
    ChangeDetectionService.prototype.doChangeDetection = function (rowNode, column) {
        if (this.gridOptionsWrapper.isSuppressChangeDetection()) {
            return;
        }
        // step 1 of change detection is to update the aggregated values
        if (this.clientSideRowModel && !rowNode.isRowPinned()) {
            var onlyChangedColumns = this.gridOptionsWrapper.isAggregateOnlyChangedColumns();
            var changedPath = new changedPath_1.ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
            changedPath.addParentNode(rowNode.parent, [column]);
            this.clientSideRowModel.doAggregate(changedPath);
        }
        // step 2 of change detection is to refresh the cells
        this.rowRenderer.refreshCells();
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ChangeDetectionService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ChangeDetectionService.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], ChangeDetectionService.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], ChangeDetectionService.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChangeDetectionService.prototype, "init", null);
    ChangeDetectionService = __decorate([
        context_1.Bean('changeDetectionService')
    ], ChangeDetectionService);
    return ChangeDetectionService;
}(beanStub_1.BeanStub));
exports.ChangeDetectionService = ChangeDetectionService;
