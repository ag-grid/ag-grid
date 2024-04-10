import { BeanStub } from "../../context/beanStub";
import { Bean, PostConstruct } from "../../context/context";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { GridBodyCtrl } from "../../gridBodyComp/gridBodyCtrl";
import { last } from "../../utils/array";
import { HeaderPosition } from "./headerPosition";

export enum HeaderNavigationDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

@Bean('headerNavigationService')
export class HeaderNavigationService extends BeanStub {

    private gridBodyCon: GridBodyCtrl;
    private currentHeaderRowWithoutSpan: number = -1;

    @PostConstruct
    private postConstruct(): void {
        this.beans.ctrlsService.whenReady(p => {
            this.gridBodyCon = p.gridBodyCtrl;
        });

        const eDocument = this.beans.gos.getDocument();
        this.addManagedListener(eDocument, 'mousedown', () => this.setCurrentHeaderRowWithoutSpan(-1));
    }

    public getHeaderRowCount(): number {
        const centerHeaderContainer = this.beans.ctrlsService.getHeaderRowContainerCtrl();
        return centerHeaderContainer ? centerHeaderContainer.getRowCount() : 0;
    }

    /*
     * This method navigates grid header vertically
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateVertically(direction: HeaderNavigationDirection, fromHeader: HeaderPosition | null, event: KeyboardEvent): boolean {
        if (!fromHeader) {
            fromHeader = this.beans.focusService.getFocusedHeader();
        }

        if (!fromHeader) { return false; }

        const { headerRowIndex, column } = fromHeader;
        const rowLen = this.getHeaderRowCount();
        const isUp = direction === HeaderNavigationDirection.UP;

        let { headerRowIndex: nextRow, column: nextFocusColumn, headerRowIndexWithoutSpan } = isUp
            ? this.beans.headerPositionUtils.getColumnVisibleParent(column, headerRowIndex)
            : this.beans.headerPositionUtils.getColumnVisibleChild(column, headerRowIndex);

        let skipColumn = false;

        if (nextRow < 0) {
            nextRow = 0;
            nextFocusColumn = column;
            skipColumn = true;
        }

        if (nextRow >= rowLen) {
            nextRow = -1; // -1 indicates the focus should move to grid rows.
            this.setCurrentHeaderRowWithoutSpan(-1);
        } else if (headerRowIndexWithoutSpan !== undefined) {
            this.currentHeaderRowWithoutSpan = headerRowIndexWithoutSpan;
        }


        if (!skipColumn && !nextFocusColumn) {
            return false;
        }

        return this.beans.focusService.focusHeaderPosition({
            headerPosition: { headerRowIndex: nextRow, column: nextFocusColumn! },
            allowUserOverride:  true,
            event
        });
    }

    public setCurrentHeaderRowWithoutSpan(row: number): void {
        this.currentHeaderRowWithoutSpan = row;
    }

    /*
     * This method navigates grid header horizontally
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateHorizontally(direction: HeaderNavigationDirection, fromTab: boolean = false, event: KeyboardEvent): boolean {
        const focusedHeader = this.beans.focusService.getFocusedHeader()!;
        const isLeft = direction === HeaderNavigationDirection.LEFT;
        const isRtl = this.beans.gos.get('enableRtl');
        let nextHeader: HeaderPosition;
        let normalisedDirection: 'Before' |  'After';

        // either navigating to the left or isRtl (cannot be both)
        if (this.currentHeaderRowWithoutSpan !== -1) {
            focusedHeader.headerRowIndex = this.currentHeaderRowWithoutSpan;
        } else {
            this.currentHeaderRowWithoutSpan = focusedHeader.headerRowIndex;
        }

        if (isLeft !== isRtl) {
            normalisedDirection = 'Before';
            nextHeader = this.beans.headerPositionUtils.findHeader(focusedHeader, normalisedDirection)!;
        } else {
            normalisedDirection = 'After';
            nextHeader = this.beans.headerPositionUtils.findHeader(focusedHeader, normalisedDirection)!;
        }

        if (nextHeader || !fromTab) {
            return this.beans.focusService.focusHeaderPosition({
                headerPosition: nextHeader,
                direction: normalisedDirection,
                fromTab,
                allowUserOverride: true,
                event
            });
        }

        return this.focusNextHeaderRow(focusedHeader, normalisedDirection, event);
    }

    private focusNextHeaderRow(focusedHeader: HeaderPosition, direction: 'Before' | 'After', event: KeyboardEvent): boolean {
        const currentIndex = focusedHeader.headerRowIndex;
        let nextPosition: HeaderPosition | null = null;
        let nextRowIndex: number;

        if (direction === 'Before') {
            if (currentIndex > 0) {
                nextRowIndex = currentIndex - 1;
                this.currentHeaderRowWithoutSpan -= 1;
                nextPosition = this.beans.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'end')!;
            }
        } else {
            nextRowIndex = currentIndex + 1;
            if (this.currentHeaderRowWithoutSpan < this.getHeaderRowCount()) {
                this.currentHeaderRowWithoutSpan += 1;
            } else {
                this.setCurrentHeaderRowWithoutSpan(-1);
            }
            nextPosition = this.beans.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'start')!;
        }

        if (!nextPosition) { return false; }

        const { column, headerRowIndex } = this.beans.headerPositionUtils.getHeaderIndexToFocus(nextPosition.column, nextPosition?.headerRowIndex)

        return this.beans.focusService.focusHeaderPosition({
            headerPosition: { column, headerRowIndex },
            direction,
            fromTab: true,
            allowUserOverride: true,
            event
        });
    }

    public scrollToColumn(column: Column | ColumnGroup, direction: 'Before' | 'After' | null = 'After'): void {
        if (column.getPinned()) { return; }

        let columnToScrollTo: Column;

        if (column instanceof ColumnGroup) {
            const columns = column.getDisplayedLeafColumns();
            columnToScrollTo = direction === 'Before' ? last(columns) : columns[0];
        } else {
            columnToScrollTo = column;
        }

        this.gridBodyCon.getScrollFeature().ensureColumnVisible(columnToScrollTo);
    }
}
