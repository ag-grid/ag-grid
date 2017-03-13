import {IDatasource, IGetRowsParams} from "../iDatasource";
import {RowNode} from "../../entities/rowNode";
import {SortService} from "../../rowNodes/sortService";
import {FilterService} from "../../rowNodes/filterService";


export class PaginationDataSource implements IDatasource{
    public rowCount: number;

    constructor(
        private rootNode: RowNode,
        private sortService: SortService,
        private filterService: FilterService,
    ){
        this.rowCount = this.rootNode.allLeafChildren.length;
    }

    getRows(params: IGetRowsParams): void {
        this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren.slice(0);
        this.filterService.filterAccordingToColumnState(this.rootNode);
        this.sortService.sortAccordingToColumnsState(this.rootNode);
        let afterFilterAndSort: any[] = this.rootNode.childrenAfterSort.map((rowNode:RowNode)=>{
            return rowNode.data
        });


        var rowsThisPage = afterFilterAndSort.slice(params.startRow, params.endRow);
        var lastRow = -1;
        if (afterFilterAndSort.length <= params.endRow) {
            lastRow = this.rootNode.allLeafChildren.length;
        }

        this.rowCount = afterFilterAndSort.length;
        params.successCallback(rowsThisPage, lastRow);
    }

}