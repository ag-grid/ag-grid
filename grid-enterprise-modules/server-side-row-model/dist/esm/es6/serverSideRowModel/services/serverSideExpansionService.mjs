var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, Events, ExpansionService } from "@ag-grid-community/core";
let ServerSideExpansionService = class ServerSideExpansionService extends ExpansionService {
    constructor() {
        super(...arguments);
        this.queuedRowIds = new Set();
    }
    postConstruct() {
        super.postConstruct();
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => {
            this.queuedRowIds.clear();
        });
    }
    checkOpenByDefault(rowNode) {
        if (!rowNode.isExpandable()) {
            return;
        }
        const expandRowNode = () => {
            // we do this in a timeout, so that we don't expand a row node while in the middle
            // of setting up rows, setting up rows is complex enough without another chunk of work
            // getting added to the call stack. this is also helpful as openByDefault may or may
            // not happen (so makes setting up rows more deterministic by expands never happening)
            // and also checkOpenByDefault is shard with both store types, so easier control how it
            // impacts things by keeping it in new VM turn.
            window.setTimeout(() => rowNode.setExpanded(true), 0);
        };
        if (this.queuedRowIds.has(rowNode.id)) {
            this.queuedRowIds.delete(rowNode.id);
            expandRowNode();
            return;
        }
        const userFunc = this.gridOptionsService.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return;
        }
        const params = {
            data: rowNode.data,
            rowNode
        };
        const userFuncRes = userFunc(params);
        if (userFuncRes) {
            expandRowNode();
        }
    }
    expandRows(rowIds) {
        rowIds.forEach(rowId => {
            const rowNode = this.serverSideRowModel.getRowNode(rowId);
            if (rowNode) {
                rowNode.setExpanded(true);
            }
            else {
                this.queuedRowIds.add(rowId);
            }
        });
    }
    expandAll(value) {
        this.serverSideRowModel.expandAll(value);
    }
    onGroupExpandedOrCollapsed() {
        // do nothing
    }
};
__decorate([
    Autowired('rowModel')
], ServerSideExpansionService.prototype, "serverSideRowModel", void 0);
ServerSideExpansionService = __decorate([
    Bean('expansionService')
], ServerSideExpansionService);
export { ServerSideExpansionService };
