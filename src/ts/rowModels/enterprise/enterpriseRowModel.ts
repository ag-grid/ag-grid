
import {IRowModel} from "../../interfaces/iRowModel";
import {RowNode} from "../../entities/rowNode";
import {Constants} from "../../constants";
import {Bean, PostConstruct, Autowired} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";

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

    private rootNode = new RowNode();
    private datasource: IEnterpriseDatasource;

    @PostConstruct
    private postConstruct(): void {
        this.rootNode.group = true;
        this.rootNode.level = -1;

        this.datasource = this.gridOptionsWrapper.getEnterpriseDatasource();
        if (this.datasource) {
            this.loadNode(this.rootNode);
        }
    }

    public setDatasource(datasource: IEnterpriseDatasource): void {

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

    private successCallback(rowNode: RowNode, rowsThisPage: any[]): void {
    }

    private failCallback(rowNode: RowNode): void {
    }

    public getRow(index: number): RowNode {
        return null;
    }

    public getRowCount(): number {
        return null;
    }

    public getRowIndexAtPixel(pixel: number): number {
        return 0;
    }

    public getRowCombinedHeight(): number {
        return 0;
    }

    public isRowPresent(rowNode: RowNode): boolean {
        return false;
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void {

    }

    public removeItems(rowNodes: RowNode[], skipRefresh: boolean): void {

    }

    public addItems(items: any[], skipRefresh: boolean): void {

    }

    public isEmpty(): boolean {
        return true;
    }

    public isRowsToRender(): boolean {
        return false;
    }

    public forEachNode(callback: (rowNode: RowNode)=>void): void {
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_ENTERPRISE;
    }

}
