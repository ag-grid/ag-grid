import {
    _,
    Autowired,
    BeanStub,
    StoreUpdatedEvent,
    Events,
    PostConstruct,
    RowGroupOpenedEvent,
    RowNode,
    Bean,
    Beans,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { ServerSideRowModel } from "../serverSideRowModel";
import { StoreFactory } from "../stores/storeFactory";

@Bean('ssrmExpandListener')
export class ExpandListener extends BeanStub {

    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;
    @Autowired('ssrmStoreFactory') private storeFactory: StoreFactory;
    @Autowired('beans') private beans: Beans;

    @PostConstruct
    private postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) { return; }

        this.addManagedListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    }

    private onRowGroupOpened(event: RowGroupOpenedEvent): void {
        const rowNode: RowNode = event.node;

        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            } else if (_.missing(rowNode.childStore)) {
                const storeParams = this.serverSideRowModel.getParams();
                rowNode.childStore = this.createBean(this.storeFactory.createStore(storeParams, rowNode));
            }
        } else if (this.gridOptionsService.is('purgeClosedRowNodes') && _.exists(rowNode.childStore)) {
            rowNode.childStore = this.destroyBean(rowNode.childStore)!;
        }

        const storeUpdatedEvent: WithoutGridCommon<StoreUpdatedEvent> = { type: Events.EVENT_STORE_UPDATED };
        this.eventService.dispatchEvent(storeUpdatedEvent);
    }

    private createDetailNode(masterNode: RowNode): RowNode {
        if (_.exists(masterNode.detailNode)) { return masterNode.detailNode; }

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

}