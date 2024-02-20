var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../context/beanStub.mjs";
import { Autowired, Bean, PostConstruct } from "../context/context.mjs";
import { ChangedPath } from "../utils/changedPath.mjs";
import { Events } from "../events.mjs";
// Matches value in clipboard module
const SOURCE_PASTE = 'paste';
let ChangeDetectionService = class ChangeDetectionService extends BeanStub {
    init() {
        if (this.rowModel.getType() === 'clientSide') {
            this.clientSideRowModel = this.rowModel;
        }
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged.bind(this));
    }
    onCellValueChanged(event) {
        // Clipboard service manages its own change detection, so no need to do it here.
        // The clipboard manages its own as otherwise this would happen once for every cell
        // that got updated as part of a paste operation, so e.g. if 100 cells in a paste operation,
        // this doChangeDetection would get called 100 times (once for each cell), instead clipboard
        // service executes the logic we have here once (in essence batching up all cell changes
        // into one change detection).
        if (event.source === SOURCE_PASTE) {
            return;
        }
        this.doChangeDetection(event.node, event.column);
    }
    doChangeDetection(rowNode, column) {
        if (this.gridOptionsService.get('suppressChangeDetection')) {
            return;
        }
        const nodesToRefresh = [rowNode];
        // step 1 of change detection is to update the aggregated values
        if (this.clientSideRowModel && !rowNode.isRowPinned()) {
            const onlyChangedColumns = this.gridOptionsService.get('aggregateOnlyChangedColumns');
            const changedPath = new ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
            changedPath.addParentNode(rowNode.parent, [column]);
            this.clientSideRowModel.doAggregate(changedPath);
            // add all nodes impacted by aggregation, as they need refreshed also.
            changedPath.forEachChangedNodeDepthFirst(rowNode => {
                nodesToRefresh.push(rowNode);
            });
        }
        // step 2 of change detection is to refresh the cells
        this.rowRenderer.refreshCells({ rowNodes: nodesToRefresh });
    }
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
export { ChangeDetectionService };
