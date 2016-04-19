import {RowNode} from "../entities/rowNode";
export interface IViewportDatasource {

    init(params: IViewportDatasourceParams): void;
    
    /** Tell the viewport what the scroll position of the grid is, so it knows what rows it has to get */
    setViewportRange(firstRow: number, lastRow: number): void;

    destroy?(): void;
}

export interface IViewportDatasourceParams {
    /** datasource calls this method when the total row count changes */
    setRowCount: (count:number) => void,
    /** datasource calls this when new data arrives */
    setRowData: (rowData:{[key:number]:any}) => void,
    /** datasource calls this when it wants a row node - typically used when it wants to update the row node */
    getRow: (rowIndex: number) => RowNode
}
