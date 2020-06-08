import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { Bean, Autowired } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { ColumnController } from "../../columnController/columnController";
import { HeaderNavigationService } from "./headerNavigationService";
import { HeaderRowType } from "../headerRowComp";

export interface HeaderPosition {
    headerRowIndex: number;
    column: Column | ColumnGroup;
}

@Bean('headerPositionUtils')
export class HeaderPositionUtils extends BeanStub {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;

    public findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition {
        let nextColumn: Column | ColumnGroup;
        let getGroupMethod: 'getDisplayedGroupBefore' | 'getDisplayedGroupAfter';
        let getColMethod: 'getDisplayedColBefore' | 'getDisplayedColAfter';

        if (focusedHeader.column instanceof ColumnGroup) {
            getGroupMethod = `getDisplayedGroup${direction}` as any;
            nextColumn = this.columnController[getGroupMethod](focusedHeader.column as ColumnGroup);
        } else {
            getColMethod = `getDisplayedCol${direction}` as any;
            nextColumn = this.columnController[getColMethod](focusedHeader.column as Column);
        }

        if (nextColumn) {
            return {
                column: nextColumn,
                headerRowIndex: focusedHeader.headerRowIndex
            };
        }
    }

    public findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition {
        const displayedColumns = this.columnController.getAllDisplayedColumns();
        const column = displayedColumns[position === 'start' ? 0 : displayedColumns.length - 1];

        if (!column) { return; }

        const childContainer = this.headerNavigationService.getHeaderContainer(column.getPinned());
        const headerRowComp = childContainer.getRowComps()[level];
        const type = headerRowComp && headerRowComp.getType();

        if (type == HeaderRowType.COLUMN_GROUP) {
            const columnGroup = this.columnController.getColumnGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup
            };
        }

        return {
            headerRowIndex: !headerRowComp ? -1 : level,
            column
        };
    }
}
