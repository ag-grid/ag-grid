import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { Bean, Autowired } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { ColumnController } from "../../columnController/columnController";

export interface HeaderPosition {
    headerRowIndex: number;
    pinned: string;
    column: Column | ColumnGroup;
}

@Bean('headerPositionUtils')
export class HeaderPositionUtils extends BeanStub {

    @Autowired('columnController') private columnController: ColumnController;

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
                pinned: nextColumn.getPinned(),
                headerRowIndex: focusedHeader.headerRowIndex
            };
        }
    }
}
