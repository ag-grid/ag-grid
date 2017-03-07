
import {IRowModel} from "../../interfaces/iRowModel";
import {RowNode} from "../../entities/rowNode";
import {Constants} from "../../constants";
import {Bean, PostConstruct, Autowired, Context} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {_} from "../../utils";
import {EventService} from "../../eventService";
import {Events, ModelUpdatedEvent} from "../../events";
import {FlattenStage} from "../inMemory/flattenStage";
import {ColumnController} from "../../columnController/columnController";
import {Column} from "../../entities/column";

// + get simple version working, no pagination, just parent / child lazy loading
// + user changing dimensions
// + server side sort and filter
// + pagination
// + pivot

// step 1 - load the root node

export interface IEnterpriseGetRowsParams {
    // startRow: number;
    // endRow: number;

    successCallback(rowsThisPage: any[]): void;

    failCallback(): void;

    rowGroupCols: ColumnVO[];
    valueCols: ColumnVO[];
    pivotCols: ColumnVO[];
    groupKeys: string[];

    // sortModel: any,
    // filterModel: any,
    // context: any
}

export interface IEnterpriseDatasource {
    getRows(params: IEnterpriseGetRowsParams): void;
}

export class ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}

@Bean('rowModel')
export class EnterpriseRowModel implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('flattenStage') private flattenStage: FlattenStage;
    @Autowired('columnController') private columnController: ColumnController;

    private rootNode: RowNode;
    private datasource: IEnterpriseDatasource;
    private rowHeight: number;

    private rowsToDisplay: RowNode[];

    private nextId: number;

    // each time the data changes we increment the instance version.
    // that way we know to discard any daemon network calls, that are bringing
    // back data for an old version.
    private instanceVersion = 0;

    @PostConstruct
    private postConstruct(): void {

        this.eventService.addModalPriorityEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.eventService.addModalPriorityEventListener(Events.EVENT_ROW_GROUP_OPENED, this.onRowGroupOpened.bind(this));

        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.datasource = this.gridOptionsWrapper.getEnterpriseDatasource();

        if (this.datasource) {
            this.reset();
        }
    }

    private onColumnRowGroupChanged(): void {
        if (this.datasource) {
            this.reset();
        }
    }

    private onRowGroupOpened(event: any): void {
        let openedNode = event.node;
        if (openedNode.expanded && _.missing(openedNode.childrenAfterSort)) {
            this.loadNode(openedNode);
        } else {
            this.mapAndFireModelUpdated();
        }
    }

    private reset(): void {
        this.nextId = 0;
        this.rowsToDisplay = null;
        this.instanceVersion++;

        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.context.wireBean(this.rootNode);

        this.loadNode(this.rootNode);

        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_CHANGED);

        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start)
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
    }

    public setDatasource(datasource: IEnterpriseDatasource): void {
        this.datasource = datasource;
        this.reset();
    }

    private loadNode(rowNode: RowNode): void {
        let params = this.createLoadParams(rowNode);
        setTimeout(()=> {
            this.datasource.getRows(params);
        }, 0);
    }

    private createGroupKeys(groupNode: RowNode): string[] {
        let keys: string[] = [];

        let pointer = groupNode;
        while (pointer.level >= 0) {
            keys.push(groupNode.key);
            pointer = groupNode.parent;
        }

        return keys;
    }

    private createLoadParams(rowNode: RowNode): IEnterpriseGetRowsParams {
        let groupKeys = this.createGroupKeys(rowNode);

        let rowGroupColumnVos = this.toValueObjects(this.columnController.getRowGroupColumns());
        let valueColumnVos = this.toValueObjects(this.columnController.getValueColumns());
        let pivotColumnVos = this.toValueObjects(this.columnController.getPivotColumns());

        let params = <IEnterpriseGetRowsParams> {
            successCallback: this.successCallback.bind(this, this.instanceVersion, rowNode),
            failCallback: this.failCallback.bind(this, this.instanceVersion, rowNode),
            rowGroupCols: rowGroupColumnVos,
            valueCols: valueColumnVos,
            pivotCols: pivotColumnVos,
            groupKeys: groupKeys
        };

        return params;
    }

    private toValueObjects(columns: Column[]): ColumnVO[] {
        return columns.map( col => <ColumnVO> {
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: this.columnController.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        });
    }

    private successCallback(instanceVersion: number, parentNode: RowNode, dataItems: any[]): void {
        let isDaemon = instanceVersion !== this.instanceVersion;
        if (isDaemon) { return; }

        let groupCols = this.columnController.getRowGroupColumns();
        let newNodesLevel = parentNode.level + 1;
        let newNodesAreGroups = groupCols.length > newNodesLevel;
        let field = newNodesAreGroups ? groupCols[newNodesLevel].getColDef().field : null;

        parentNode.childrenAfterSort = [];
        if (dataItems) {
            dataItems.forEach( dataItem => {

                let childNode = new RowNode();
                this.context.wireBean(childNode);

                childNode.group = newNodesAreGroups;
                childNode.level = newNodesLevel;
                childNode.parent = parentNode;

                childNode.setDataAndId(dataItem, this.nextId.toString());

                if (newNodesAreGroups) {
                    childNode.expanded = false;
                    childNode.field = field;
                    childNode.key = dataItem[field];
                }

                parentNode.childrenAfterSort.push(childNode);

                this.nextId++;
            });
        }

        this.mapAndFireModelUpdated();
    }

    private mapAndFireModelUpdated(): void {
        this.doRowsToDisplay();

        let event: ModelUpdatedEvent = {animate: true, keepRenderedRows: true, newData: false};
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED, event);
    }

    private failCallback(instanceVersion: number, rowNode: RowNode): void {
        let isDaemon = instanceVersion !== this.instanceVersion;
        if (isDaemon) { return; }
    }

    public getRow(index: number): RowNode {
        return this.rowsToDisplay[index];
    }

    public getRowCount(): number {
        return this.rowsToDisplay ? this.rowsToDisplay.length : 0;
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            return Math.floor(pixel / this.rowHeight);
        } else {
            return 0;
        }
    }

    public getRowCombinedHeight(): number {
        return this.getRowCount() * this.rowHeight;
    }

    public isEmpty(): boolean {
        return _.missing(this.rootNode);
    }

    public isRowsToRender(): boolean {
        return this.rowsToDisplay ? this.rowsToDisplay.length > 0 : false;
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_ENTERPRISE;
    }

    private doRowsToDisplay() {
        this.rowsToDisplay = <RowNode[]> this.flattenStage.execute({rowNode: this.rootNode});
    }

    public forEachNode(callback: (rowNode: RowNode)=>void): void {
        console.log('forEachNode not supported in enterprise row model');
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void {
        console.log('insertItemsAtIndex not supported in enterprise row model');
    }

    public removeItems(rowNodes: RowNode[], skipRefresh: boolean): void {
        console.log('removeItems not supported in enterprise row model');
    }

    public addItems(item: any[], skipRefresh: boolean): void {
        console.log('addItems not supported in enterprise row model');
    }

    public isRowPresent(rowNode: RowNode): boolean {
        console.log('isRowPresent not supported in enterprise row model');
        return false;
    }

}
