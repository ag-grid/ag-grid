"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandListener = void 0;
const core_1 = require("@ag-grid-community/core");
let ExpandListener = class ExpandListener extends core_1.BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    }
    onRowGroupOpened(event) {
        const rowNode = event.node;
        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            }
            else if (core_1._.missing(rowNode.childStore)) {
                const storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        }
        else if (this.gridOptionsService.is('purgeClosedRowNodes') && core_1._.exists(rowNode.childStore)) {
            rowNode.childStore = this.destroyBean(rowNode.childStore);
        }
        const storeUpdatedEvent = { type: core_1.Events.EVENT_STORE_UPDATED };
        this.eventService.dispatchEvent(storeUpdatedEvent);
    }
    createDetailNode(masterNode) {
        if (core_1._.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        const detailNode = new core_1.RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (core_1._.exists(masterNode.id)) {
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
    core_1.Autowired('rowModel')
], ExpandListener.prototype, "serverSideRowModel", void 0);
__decorate([
    core_1.Autowired('ssrmStoreFactory')
], ExpandListener.prototype, "storeFactory", void 0);
__decorate([
    core_1.Autowired('beans')
], ExpandListener.prototype, "beans", void 0);
__decorate([
    core_1.PostConstruct
], ExpandListener.prototype, "postConstruct", null);
ExpandListener = __decorate([
    core_1.Bean('ssrmExpandListener')
], ExpandListener);
exports.ExpandListener = ExpandListener;
