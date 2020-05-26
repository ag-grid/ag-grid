import { Bean, Autowired } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { HeaderContainer } from "../headerContainer";
import { FocusController } from "../../focusController";
import { HeaderPosition, HeaderPositionUtils } from "./headerPosition";
import { ColumnGroup } from "../../entities/columnGroup";
import { Column } from "../../entities/column";
import { HeaderRowType } from "../headerRowComp";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { GridPanel } from "../../gridPanel/gridPanel";
import { AnimationFrameService } from "../../misc/animationFrameService";
import { _ } from "../../utils";

export enum HeaderContainerTypes {
    LeftContainer,
    CenterContainer,
    RightContainer
}

export enum HeaderNavigationDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

@Bean('headerController')
export class HeaderController extends BeanStub {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('focusController') private focusController: FocusController;
    @Autowired('headerPositionUtils') private headerPositionUtils: HeaderPositionUtils;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;

    private headerContainers: HeaderContainer[] = [];
    private gridPanel: GridPanel;

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    public registerHeaderContainer(headerContainer: HeaderContainer, type: HeaderContainerTypes): void {
        this.headerContainers[type] = headerContainer;
    }

    public getHeaderContainers(): HeaderContainer[] {
        return this.headerContainers;
    }

    public getHeaderRowCount(): number {
        return this.headerContainers.length === 0 ? 0 : this.headerContainers[0].getRowComps().length;
    }

    public getHeaderRowType(idx: number): HeaderRowType {
        if (this.getHeaderRowCount()) {
            return this.headerContainers[0].getRowComps()[idx].getType();
        }
    }

    public getHeaderContainer(pinned: string): HeaderContainer {
        const containerIdx = pinned === 'left'
            ? HeaderContainerTypes.LeftContainer
            : (pinned === 'right'
                ? HeaderContainerTypes.RightContainer
                : HeaderContainerTypes.CenterContainer
            );

        return this.headerContainers[containerIdx];
    }

    /*
     * This method navigates grid header vertically
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateVertically(direction: HeaderNavigationDirection, fromHeader?: HeaderPosition): boolean {
        if (!fromHeader) {
            fromHeader = this.focusController.getFocusedHeader();
        }

        if (!fromHeader) { return false; }

        const { headerRowIndex, column } = fromHeader;
        const rowLen = this.getHeaderRowCount();
        const isUp = direction === HeaderNavigationDirection.UP ;
        const nextRow = isUp ?  headerRowIndex - 1 : headerRowIndex + 1;

        if (nextRow < 0) { return false; }

        if (nextRow >= rowLen) {
            // focusGridView returns false when the grid has no cells rendered.
            return this.focusController.focusGridView();
        }

        const currentRowType = this.getHeaderRowType(headerRowIndex);

        let nextFocusColumn: ColumnGroup | Column;

        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            const currentColumn = column as ColumnGroup;
            nextFocusColumn = isUp ? column.getParent() : currentColumn.getDisplayedChildren()[0] as ColumnGroup;
        } else if (currentRowType === HeaderRowType.FLOATING_FILTER) {
            nextFocusColumn = column;
        } else {
            const currentColumn = column as Column;
            nextFocusColumn = isUp ? currentColumn.getParent() : currentColumn;
        }

        if (!nextFocusColumn) { return false; }

        this.focusController.focusHeaderPosition({
            headerRowIndex: nextRow,
            column: nextFocusColumn
        });

        return true;
    }

    /*
     * This method navigates grid header horizontally
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateHorizontally(direction: HeaderNavigationDirection, fromTab?: boolean): boolean {
        const focusedHeader = this.focusController.getFocusedHeader();
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        let nextHeader: HeaderPosition;
        let normalisedDirection: 'Before' |  'After';

        if (direction === HeaderNavigationDirection.LEFT !== isRtl) {
            normalisedDirection = 'Before';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, normalisedDirection);
        } else {
            normalisedDirection = 'After';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, normalisedDirection);
        }

        if (nextHeader) {
            this.focusController.focusHeaderPosition(nextHeader, normalisedDirection);
            return true;
        }

        if (!fromTab) { return true; }

        return this.focusNextHeaderRow(focusedHeader, normalisedDirection);
    }

    private focusNextHeaderRow(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): boolean {
        const currentIndex = focusedHeader.headerRowIndex;
        let nextPosition: HeaderPosition;
        let nextRowIndex: number;

        if (direction === 'Before') {
            if (currentIndex === 0) { return false; }
            nextRowIndex = currentIndex - 1;
            nextPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'end');
        } else {
            nextRowIndex = currentIndex + 1;
            nextPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'start');
        }

        if (nextPosition) {
            if (nextPosition.headerRowIndex === -1) {
                return this.focusController.focusGridView(nextPosition.column as Column);
            }

            return this.focusController.focusHeaderPosition(nextPosition, direction);
        }

        return false;
    }

    public scrollToColumn(column: Column | ColumnGroup, direction: 'Before' | 'After' = 'After'): void {
        if (column.getPinned()) { return; }
        let columnToScrollTo: Column;

        if (column instanceof ColumnGroup) {
            const columns = column.getDisplayedLeafColumns();
            columnToScrollTo = direction === 'Before' ? _.last(columns) : columns[0];
        } else {
            columnToScrollTo = column;
        }

        this.gridPanel.ensureColumnVisible(columnToScrollTo);

        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
        // floating cell, the scrolls get out of sync
        this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();

        // need to flush frames, to make sure the correct cells are rendered
        this.animationFrameService.flushAllFrames();
    }
}
