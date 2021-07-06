import { Autowired, Bean, PostConstruct } from "../context/context";
import { ColumnModel } from "../columns/columnModel";
import { ColumnGroupChild } from "../entities/columnGroupChild";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { PaginationProxy } from "../pagination/paginationProxy";
import { ValueService } from "../valueService/valueService";
import { BeanStub } from "../context/beanStub";
import { Events } from "../eventKeys";

export interface HeaderRowSt {
    headerRowIndex: number;
    groupLevel: boolean;
    columns: ColumnSt[];
}

export interface ColumnSt {
    name: string | null;
    id: string;
}

export interface RowSt {
    index: number;
    cells: CellSt[];
    id: string;
    height: number;
    top: number;
}

export interface CellSt {
    value: any;
    colId: string;
    width: number;
    left: number;
}

export interface RowContainerSt {
    height: number;
    width: number;
}

@Bean('headlessService')
export class HeadlessService extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('valueService') private valueService: ValueService;

    public static EVENT_ROWS_UPDATED = 'rowsUpdated';
    public static EVENT_HEADERS_UPDATED = 'headersUpdated';
    public static EVENT_ROW_CONTAINER_UPDATED = 'rowContainerUpdated';

    private headerRows: HeaderRowSt[];
    private rows: RowSt[];
    private centerRowContainer: RowContainerSt;

    public getHeaderRows(): HeaderRowSt[] {
        return this.headerRows;
    }

    public getRows(): RowSt[] {
        return this.rows;
    }

    public getCenterRowContainer(): RowContainerSt {
        return this.centerRowContainer;
    }

    @PostConstruct
    private postConstruct(): void {
        this.createHeaderRows();
        this.onPageLoaded();

        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPageLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, () => {
            this.createHeaderRows();
            this.onPageLoaded();
        });
    }

    private createHeaderRows(): void {
        this.headerRows = [];

        const headerRowCount = this.columnModel.getHeaderRowCount();
        for (let i = 0; i < headerRowCount; i++) {
            const groupLevel = i === (headerRowCount - 1);
            this.headerRows.push(this.createHeaderRow(i, groupLevel));
        }

        this.dispatchEvent({type: HeadlessService.EVENT_HEADERS_UPDATED});
    }

    public onPageLoaded(): void {
        this.rows = [];

        const firstRow = this.paginationProxy.getPageFirstRow();
        const lastRow = this.paginationProxy.getPageLastRow();

        // first and last rows are -1 if no rows to display
        if (firstRow < 0 || lastRow < 0) { return; }

        const displayedColumns = this.columnModel.getDisplayedColumns(null);

        for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
            const rowNode = this.paginationProxy.getRow(rowIndex);
            if (!rowNode) { continue; }
            const cells: CellSt[] = [];
            const rowVo: RowSt = {
                cells,
                index: rowIndex,
                id: rowNode.id!,
                height: rowNode.rowHeight!,
                top: rowNode.rowTop!
            };
            displayedColumns.forEach(col => {
                cells.push({
                    value: this.valueService.getValue(col, rowNode),
                    colId: col.getId(),
                    width: col.getActualWidth(),
                    left: col.getLeft()!
                });
            });
            this.rows.push(rowVo);
        }

        this.dispatchEvent({type: HeadlessService.EVENT_ROWS_UPDATED});

        this.centerRowContainer = {
            height: Math.max(this.paginationProxy.getCurrentPageHeight(), 1),
            width: this.columnModel.getBodyContainerWidth()
        };
        this.dispatchEvent({type: HeadlessService.EVENT_ROW_CONTAINER_UPDATED});
    }

    private createHeaderRow(depth: number, groupLevel: boolean): HeaderRowSt {
        const items = this.columnModel.getVirtualHeaderGroupRow(null, depth);

        const mapColumn = (item: ColumnGroupChild): ColumnSt => {
            const isCol = item instanceof Column;
            const name = isCol
                ? this.columnModel.getDisplayNameForColumn(item as Column, 'header')
                : this.columnModel.getDisplayNameForColumnGroup(item as ColumnGroup, 'header');
            const res: ColumnSt = {
                name,
                id: item.getUniqueId()
            };
            return res;
        };

        const res: HeaderRowSt = {
            headerRowIndex: depth,
            groupLevel,
            columns: items.map(mapColumn)
        };
        return res;
    }

}
