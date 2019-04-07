/**
 * This is a chart row model. It's a simpler version of Client Side Row Model fit for charting (as charts
 * have simpler and different use row model requirement. For example aggregation, for charts, only needs to
 * bucket into top level items, however aggregation for grids means a tree structure and order.
 */
import {BeanStub, CellRange} from "ag-grid-community";

export class RangeChartRowModel extends BeanStub {

    private cellRange: CellRange;

    constructor(cellRange: CellRange) {
        super();
        this.cellRange = cellRange;
    }

}