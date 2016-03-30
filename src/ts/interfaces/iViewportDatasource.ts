import {RowNode} from "../entities/rowNode";
export interface IViewportDatasource {

    // setRowCount: this.setRowCount.bind(this),
    // setRowData: this.setRowData.bind(this)

    init(
        params: {
            /** datasource calls this method when the total row count changes */
            setRowCount: (count:number) => void,
            /** datasource calls this when new data arrives */
            setRowData: (rowData:{[key:number]:any}) => void,
            /** datasource calls this when it wants a row node - typically used when it wants to update the row node */
            getRow: (rowIndex: number) => RowNode
        }
    ): void;
    
    /** Tell the viewport what the scroll position of the grid is, so it knows what rows it has to get */
    setViewportRange(firstRow: number, lastRow: number): void;

    destroy?(): void;
}
