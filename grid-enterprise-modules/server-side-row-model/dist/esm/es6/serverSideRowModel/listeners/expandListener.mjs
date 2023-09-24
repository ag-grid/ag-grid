var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, BeanStub, Events, PostConstruct, RowNode, Bean } from "@ag-grid-community/core";
let ExpandListener = class ExpandListener extends BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    }
    onRowGroupOpened(event) {
        const rowNode = event.node;
        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            }
            else if (_.missing(rowNode.childStore)) {
                const storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        }
        else if (this.gridOptionsService.is('purgeClosedRowNodes') && _.exists(rowNode.childStore)) {
            rowNode.childStore = this.destroyBean(rowNode.childStore);
        }
        const storeUpdatedEvent = { type: Events.EVENT_STORE_UPDATED };
        this.eventService.dispatchEvent(storeUpdatedEvent);
    }
    createDetailNode(masterNode) {
        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        const detailNode = new RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (_.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        const defaultDetailRowHeight = 200;
        const rowHeight = this.gridOptionsService.getRowHeightForNode(detailNode).height;
        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
        masterNode.detailNode = detailNode;
        return detailNode;
    }
};
__decorate([
    Autowired('rowModel')
], ExpandListener.prototype, "serverSideRowModel", void 0);
__decorate([
    Autowired('ssrmStoreFactory')
], ExpandListener.prototype, "storeFactory", void 0);
__decorate([
    Autowired('beans')
], ExpandListener.prototype, "beans", void 0);
__decorate([
    PostConstruct
], ExpandListener.prototype, "postConstruct", null);
ExpandListener = __decorate([
    Bean('ssrmExpandListener')
], ExpandListener);
export { ExpandListener };
