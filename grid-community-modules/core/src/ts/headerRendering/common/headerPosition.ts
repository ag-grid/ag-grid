import { ColumnModel } from "../../columns/columnModel";
import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean } from "../../context/context";
import { CtrlsService } from "../../ctrlsService";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { HeaderRowType } from "../row/headerRowComp";

export interface HeaderPosition {
/** A number from 0 to n, where n is the last header row the grid is rendering */
    headerRowIndex: number;
/** The grid column or column group */
    column: Column | ColumnGroup;
}

@Bean('headerPositionUtils')
export class HeaderPositionUtils extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

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

        const childContainer = this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned());
        const type = childContainer.getRowType(level);

        if (type == HeaderRowType.COLUMN_GROUP) {
            const columnGroup = this.columnModel.getColumnGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup!
            };
        }

        return {
            // if type==null, means the header level didn't exist
            headerRowIndex: type == null ? -1 : level,
            column
        };
    }
}
