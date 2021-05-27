import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { Bean, Autowired } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { ColumnModel } from "../../columns/columnModel";
import { HeaderNavigationService } from "./headerNavigationService";
import { HeaderRowType } from "../headerRowComp";

export interface HeaderPosition {
    headerRowIndex: number;
    column: Column | ColumnGroup;
}

@Bean('headerPositionUtils')
export class HeaderPositionUtils extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;

    public findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined {
        let nextColumn: Column | ColumnGroup;
        let getGroupMethod: 'getDisplayedGroupBefore' | 'getDisplayedGroupAfter';
        let getColMethod: 'getDisplayedColBefore' | 'getDisplayedColAfter';

        if (focusedHeader.column instanceof ColumnGroup) {
            getGroupMethod = `getDisplayedGroup${direction}` as any;
            nextColumn = this.columnModel[getGroupMethod](focusedHeader.column)!;
        } else {
            getColMethod = `getDisplayedCol${direction}` as any;
            nextColumn = this.columnModel[getColMethod](focusedHeader.column)!;
        }

        if (nextColumn) {
            return {
                column: nextColumn,
                headerRowIndex: focusedHeader.headerRowIndex
            };
        }
    }

    public findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition | undefined {
        const displayedColumns = this.columnModel.getAllDisplayedColumns();
        const column = displayedColumns[position === 'start' ? 0 : displayedColumns.length - 1];

        if (!column) { return; }

        const childContainer = this.headerNavigationService.getHeaderContainer(column.getPinned());
        const headerRowComp = childContainer!.getRowComps()[level];
        const type = headerRowComp && headerRowComp.getType();

        if (type == HeaderRowType.COLUMN_GROUP) {
            const columnGroup = this.columnModel.getColumnGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup!
            };
        }

        return {
            headerRowIndex: !headerRowComp ? -1 : level,
            column
        };
    }
}
