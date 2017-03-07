
import {IRowModel} from "../../interfaces/iRowModel";
import {RowNode} from "../../entities/rowNode";
import {Constants} from "../../constants";
import {Bean, PostConstruct, Autowired, Context} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {_} from "../../utils";
import {EventService} from "../../eventService";
import {Events, ModelUpdatedEvent} from "../../events";
import {FlattenStage} from "../inMemory/flattenStage";

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

    // sortModel: any,
    // filterModel: any,
    // context: any
}

export interface IEnterpriseDatasource {
    getRows(params: IEnterpriseGetRowsParams): void;
}

@Bean('rowModel')
export class EnterpriseRowModel implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('flattenStage') private flattenStage: FlattenStage;

    private rootNode: RowNode;
    private datasource: IEnterpriseDatasource;
    private rowHeight: number;

    private rowsToDisplay: RowNode[];

    private nextId: number;

    @PostConstruct
    private postConstruct(): void {

        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.datasource = this.gridOptionsWrapper.getEnterpriseDatasource();

        if (this.datasource) {
            this.reset();
        }
    }

    private reset(): void {
        this.nextId = 0;
        this.rowsToDisplay = null;
        this.rootNode = new RowNode();
        this.context.wireBean(this.rootNode);
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.loadNode(this.rootNode);

        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        this.eventService.dispatchEvent(Events.EVENT_ROW_DATA_CHANGED);
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

    private createLoadParams(rowNode: RowNode): IEnterpriseGetRowsParams {
        let params = <IEnterpriseGetRowsParams> {
            successCallback: this.successCallback.bind(this, rowNode),
            failCallback: this.failCallback.bind(this, rowNode)
        };
        return params;
    }

    private successCallback(rowNode: RowNode, dataItems: any[]): void {
        rowNode.childrenAfterSort = [];
        if (dataItems) {
            dataItems.forEach( dataItem => {

                let childNode = new RowNode();
                this.context.wireBean(childNode);

                childNode.group = false;
                childNode.level = rowNode.level + 1;
                childNode.parent = rowNode;

                childNode.setDataAndId(dataItem, this.nextId.toString());

                childNode.data = dataItem;

                rowNode.childrenAfterSort.push(childNode);

                this.nextId++;
            });
        }

        this.doRowsToDisplay();

        let event: ModelUpdatedEvent = {animate: true, keepRenderedRows: true, newData: false};
        this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED, event);
    }

    private failCallback(rowNode: RowNode): void {
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
