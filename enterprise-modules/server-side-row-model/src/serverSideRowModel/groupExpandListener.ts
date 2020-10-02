
import {
    _,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnApi,
    ColumnController,
    ColumnVO,
    Constants,
    Events,
    FilterManager,
    GridApi,
    GridOptionsWrapper,
    IServerSideDatasource,
    IServerSideRowModel,
    Logger,
    LoggerFactory,
    ModelUpdatedEvent,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    Qualifier,
    RowBounds,
    RowDataChangedEvent,
    RowNode,
    SortController,
    RowRenderer,
    RowNodeBlockLoader,
    RowDataTransaction,
    RowGroupOpenedEvent} from "@ag-grid-community/core";
import {ServerSideCache} from "./serverSideCache";
import {ServerSideRowModel} from "./serverSideRowModel";

export class GroupExpandListener extends BeanStub {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));
    }

    private onRowGroupOpened(event: RowGroupOpenedEvent): void {
        const rowNode: RowNode = event.node;

        if (rowNode.expanded) {
            if (rowNode.master) {
                this.createDetailNode(rowNode);
            } else if (_.missing(rowNode.childrenCache)) {
                this.serverSideRowModel.createNodeCache(rowNode);
            }
        } else if (this.gridOptionsWrapper.isPurgeClosedRowNodes() && _.exists(rowNode.childrenCache)) {
            rowNode.childrenCache = this.destroyBean(rowNode.childrenCache);
        }

        const shouldAnimate = () => {
            const rowAnimationEnabled = this.gridOptionsWrapper.isAnimateRows();

            if (rowNode.master) { return rowAnimationEnabled && rowNode.expanded; }

            return rowAnimationEnabled;
        };

        this.serverSideRowModel.updateRowIndexesAndBounds();

        const modelUpdatedEvent: ModelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!,
            newPage: false,
            newData: false,
            animate: shouldAnimate(),
            keepRenderedRows: true
        };

        this.eventService.dispatchEvent(modelUpdatedEvent);
    }

    private createDetailNode(masterNode: RowNode): RowNode {
        if (_.exists(masterNode.detailNode)) { return masterNode.detailNode; }

        const detailNode = new RowNode();

        this.getContext().createBean(detailNode);

        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;

        if (_.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }

        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;

        const defaultDetailRowHeight = 200;
        const rowHeight = this.gridOptionsWrapper.getRowHeightForNode(detailNode).height;

        detailNode.rowHeight = rowHeight ? rowHeight : defaultDetailRowHeight;
        masterNode.detailNode = detailNode;

        return detailNode;
    }

}