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
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { ChangedPath } from "../utils/changedPath";
import { Constants } from "../constants/constants";
import { Events } from "../events";
var ChangeDetectionService = /** @class */ (function (_super) {
    __extends(ChangeDetectionService, _super);
    function ChangeDetectionService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChangeDetectionService.prototype.init = function () {
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged.bind(this));
    };
    ChangeDetectionService.prototype.onCellValueChanged = function (event) {
        // Clipboard service manages its own change detection, so no need to do it here.
        // The clipboard manages its own as otherwise this would happen once for every cell
        // that got updated as part of a paste operation, so e.g. if 100 cells in a paste operation,
        // this doChangeDetection would get called 100 times (once for each cell), instead clipboard
        // service executes the logic we have here once (in essence batching up all cell changes
        // into one change detection).
        if (event.source === Constants.SOURCE_PASTE) {
            return;
        }
        this.doChangeDetection(event.node, event.column);
    };
    ChangeDetectionService.prototype.doChangeDetection = function (rowNode, column) {
        if (this.gridOptionsWrapper.isSuppressChangeDetection()) {
            return;
        }
        // step 1 of change detection is to update the aggregated values
        if (this.clientSideRowModel && !rowNode.isRowPinned()) {
            var onlyChangedColumns = this.gridOptionsWrapper.isAggregateOnlyChangedColumns();
            var changedPath = new ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
            changedPath.addParentNode(rowNode.parent, [column]);
            this.clientSideRowModel.doAggregate(changedPath);
        }
        // step 2 of change detection is to refresh the cells
        this.rowRenderer.refreshCells();
    };
    __decorate([
        Autowired('rowModel')
    ], ChangeDetectionService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], ChangeDetectionService.prototype, "rowRenderer", void 0);
    __decorate([
        PostConstruct
    ], ChangeDetectionService.prototype, "init", null);
    ChangeDetectionService = __decorate([
        Bean('changeDetectionService')
    ], ChangeDetectionService);
    return ChangeDetectionService;
}(BeanStub));
export { ChangeDetectionService };
