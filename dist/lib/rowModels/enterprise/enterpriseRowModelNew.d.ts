// ag-grid-enterprise v9.0.3
import { IRowModel, RowNode, BeanStub, IEnterpriseDatasource } from "ag-grid";
export declare class EnterpriseRowModelNew extends BeanStub implements IRowModel {
    private gridOptionsWrapper;
    private eventService;
    private context;
    private rootNode;
    private datasource;
    private rowHeight;
    private postConstruct();
    isLastRowFound(): boolean;
    private addEventListeners();
    private onFilterChanged();
    private onSortChanged();
    private onValueChanged();
    private onColumnRowGroupChanged();
    private onRowGroupOpened(event);
    private reset();
    setDatasource(datasource: IEnterpriseDatasource): void;
    private createNodeCache(rowNode);
    getRowBounds(index: number): {
        rowTop: number;
        rowHeight: number;
    };
    getRow(index: number): RowNode;
    getPageFirstRow(): number;
    getPageLastRow(): number;
    getRowCount(): number;
    getRowIndexAtPixel(pixel: number): number;
    getCurrentPageHeight(): number;
    isEmpty(): boolean;
    isRowsToRender(): boolean;
    getType(): string;
    forEachNode(callback: (rowNode: RowNode) => void): void;
    insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void;
    removeItems(rowNodes: RowNode[], skipRefresh: boolean): void;
    addItems(item: any[], skipRefresh: boolean): void;
    isRowPresent(rowNode: RowNode): boolean;
}
