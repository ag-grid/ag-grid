import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {GridPanel} from "./gridPanel";
import {ColumnController} from "../columnController/columnController";
import {Column} from "../entities/column";
import {IRowModel} from "../interfaces/iRowModel";
import {Constants} from "../constants";
import {FloatingRowModel} from "../rowControllers/floatingRowModel";
import {Utils as _} from '../utils';
import {GridCell} from "../entities/gridCell";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

@Bean('mouseEventService')
export class MouseEventService {

    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public getCellForMouseEvent(mouseEvent: MouseEvent): GridCell {

        var floating = this.getFloating(mouseEvent);
        var rowIndex = this.getRowIndex(mouseEvent, floating);
        var column = this.getColumn(mouseEvent);

        if (rowIndex>=0 && _.exists(column)) {
            return new GridCell(rowIndex, floating, column);
        } else {
            return null;
        }

    }

    private getFloating(mouseEvent: MouseEvent): string {
        var floatingTopRect = this.gridPanel.getFloatingTopClientRect();
        var floatingBottomRect = this.gridPanel.getFloatingBottomClientRect();

        var floatingTopRowsExist = !this.floatingRowModel.isEmpty(Constants.FLOATING_TOP);
        var floatingBottomRowsExist = !this.floatingRowModel.isEmpty(Constants.FLOATING_BOTTOM);

        if (floatingTopRowsExist && floatingTopRect.bottom >= mouseEvent.clientY) {
            return Constants.FLOATING_TOP;
        } else if (floatingBottomRowsExist && floatingBottomRect.top <= mouseEvent.clientY) {
            return Constants.FLOATING_BOTTOM;
        } else {
            return null;
        }
    }

    private getFloatingRowIndex(mouseEvent: MouseEvent, floating: string): number {

        var clientRect: ClientRect;
        switch (floating) {
            case Constants.FLOATING_TOP:
                clientRect = this.gridPanel.getFloatingTopClientRect();
                break;
            case Constants.FLOATING_BOTTOM:
                clientRect = this.gridPanel.getFloatingBottomClientRect();
                break;
        }
        var bodyY = mouseEvent.clientY - clientRect.top;

        var rowIndex = this.floatingRowModel.getRowAtPixel(bodyY, floating);

        return rowIndex;
    }

    private getRowIndex(mouseEvent: MouseEvent, floating: string): number {
        switch (floating) {
            case Constants.FLOATING_TOP:
            case Constants.FLOATING_BOTTOM:
                return this.getFloatingRowIndex(mouseEvent, floating);
            default: return this.getBodyRowIndex(mouseEvent);
        }
    }

    private getBodyRowIndex(mouseEvent: MouseEvent): number {
        var clientRect = this.gridPanel.getBodyViewportClientRect();
        var scrollY = this.gridPanel.getVerticalScrollPosition();

        var bodyY = mouseEvent.clientY - clientRect.top + scrollY;

        var rowIndex = this.rowModel.getRowIndexAtPixel(bodyY);

        return rowIndex;
    }

    private getContainer(mouseEvent: MouseEvent): string {
        var centerRect = this.gridPanel.getBodyViewportClientRect();

        var mouseX = mouseEvent.clientX;
        if (mouseX < centerRect.left && this.columnController.isPinningLeft()) {
            return Column.PINNED_LEFT;
        } else if (mouseX > centerRect.right && this.columnController.isPinningRight()) {
            return Column.PINNED_RIGHT;
        } else {
            return null;
        }
    }

    private getColumn(mouseEvent: MouseEvent): Column {
        if (this.columnController.isEmpty()) {
            return null;
        }

        var container = this.getContainer(mouseEvent);
        var columns = this.getColumnsForContainer(container);
        var containerX = this.getXForContainer(container, mouseEvent);

        var hoveringColumn: Column;
        if (containerX < 0) {
            hoveringColumn = columns[0];
        }

        columns.forEach( column => {
            var afterLeft = containerX >= column.getLeft();
            var beforeRight = containerX <= column.getRight();
            if (afterLeft && beforeRight) {
                hoveringColumn = column;
            }
        });

        if (!hoveringColumn) {
            hoveringColumn = columns[columns.length - 1];
        }

        return hoveringColumn;
    }


    private getColumnsForContainer(container: string): Column[] {
        switch (container) {
            case Column.PINNED_LEFT: return this.columnController.getDisplayedLeftColumns();
            case Column.PINNED_RIGHT: return this.columnController.getDisplayedRightColumns();
            default: return this.columnController.getDisplayedCenterColumns();
        }
    }

    private getXForContainer(container: string, mouseEvent: MouseEvent): number {
        var containerX: number;
        switch (container) {
            case Column.PINNED_LEFT:
                containerX = this.gridPanel.getPinnedLeftColsViewportClientRect().left;
                break;
            case Column.PINNED_RIGHT:
                containerX = this.gridPanel.getPinnedRightColsViewportClientRect().left;
                break;
            default:
                var centerRect = this.gridPanel.getBodyViewportClientRect();
                var centerScroll = this.gridPanel.getHorizontalScrollPosition();
                containerX = centerRect.left - centerScroll;
        }
        var result = mouseEvent.clientX - containerX;
        return result;
    }

}
