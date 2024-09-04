import type { ColumnModel } from '../../columns/columnModel';
import type { VisibleColsService } from '../../columns/visibleColsService';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { CtrlsService } from '../../ctrlsService';
import type { AgColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import { isColumnGroup } from '../../entities/agColumnGroup';
import type { FocusService } from '../../focusService';
import type { GridBodyCtrl } from '../../gridBodyComp/gridBodyCtrl';
import { _getDocument } from '../../gridOptionsUtils';
import type { Column, ColumnGroup } from '../../interfaces/iColumn';
import { _last } from '../../utils/array';
import { HeaderRowType } from '../row/headerRowComp';
import type { HeaderPosition, HeaderPositionUtils } from './headerPosition';

export enum HeaderNavigationDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

export class HeaderNavigationService extends BeanStub implements NamedBean {
    beanName = 'headerNavigationService' as const;

    private focusService: FocusService;
    private headerPositionUtils: HeaderPositionUtils;
    private ctrlsService: CtrlsService;
    private columnModel: ColumnModel;
    private visibleColService: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.focusService = beans.focusService;
        this.headerPositionUtils = beans.headerPositionUtils;
        this.ctrlsService = beans.ctrlsService;
        this.columnModel = beans.columnModel;
        this.visibleColService = beans.visibleColsService;
    }

    private gridBodyCon: GridBodyCtrl;
    private currentHeaderRowWithoutSpan: number = -1;

    public postConstruct(): void {
        this.ctrlsService.whenReady(this, (p) => {
            this.gridBodyCon = p.gridBodyCtrl;
        });

        const eDocument = _getDocument(this.gos);
        this.addManagedElementListeners(eDocument, { mousedown: () => this.setCurrentHeaderRowWithoutSpan(-1) });
    }

    public getHeaderRowCount(): number {
        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        return centerHeaderContainer ? centerHeaderContainer.getRowCount() : 0;
    }

    public getHeaderPositionForColumn(
        colKey: string | Column | ColumnGroup,
        floatingFilter: boolean
    ): HeaderPosition | null {
        let column: AgColumn | AgColumnGroup | null;

        if (typeof colKey === 'string') {
            column = this.columnModel.getCol(colKey);
            if (!column) {
                column = this.visibleColService.getColumnGroup(colKey);
            }
        } else {
            column = colKey as AgColumn | AgColumnGroup;
        }

        if (!column) {
            return null;
        }

        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        const allCtrls = centerHeaderContainer?.getAllCtrls();
        const isFloatingFilterVisible = _last(allCtrls || []).getType() === HeaderRowType.FLOATING_FILTER;
        const headerRowCount = this.getHeaderRowCount() - 1;

        let row = -1;
        let col: AgColumn | AgColumnGroup | null = column;

        while (col) {
            row++;
            col = col.getParent();
        }

        let headerRowIndex = row;

        if (floatingFilter && isFloatingFilterVisible && headerRowIndex === headerRowCount - 1) {
            headerRowIndex++;
        }

        return headerRowIndex === -1
            ? null
            : {
                  headerRowIndex,
                  column,
              };
    }

    /*
     * This method navigates grid header vertically
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateVertically(
        direction: HeaderNavigationDirection,
        fromHeader: HeaderPosition | null,
        event: KeyboardEvent
    ): boolean {
        if (!fromHeader) {
            fromHeader = this.focusService.getFocusedHeader();
        }

        if (!fromHeader) {
            return false;
        }

        const { headerRowIndex } = fromHeader;
        const column = fromHeader.column as AgColumn;
        const rowLen = this.getHeaderRowCount();
        const isUp = direction === HeaderNavigationDirection.UP;

        let {
            headerRowIndex: nextRow,
            column: nextFocusColumn,
            // eslint-disable-next-line prefer-const
            headerRowIndexWithoutSpan,
        } = isUp
            ? this.headerPositionUtils.getColumnVisibleParent(column, headerRowIndex)
            : this.headerPositionUtils.getColumnVisibleChild(column, headerRowIndex);

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

        return this.focusService.focusHeaderPosition({
            headerPosition: { headerRowIndex: nextRow, column: nextFocusColumn! },
            allowUserOverride: true,
            event,
        });
    }

    public setCurrentHeaderRowWithoutSpan(row: number): void {
        this.currentHeaderRowWithoutSpan = row;
    }

    /*
     * This method navigates grid header horizontally
     * @return {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateHorizontally(
        direction: HeaderNavigationDirection,
        fromTab: boolean = false,
        event: KeyboardEvent
    ): boolean {
        const focusedHeader = this.focusService.getFocusedHeader()!;
        const isLeft = direction === HeaderNavigationDirection.LEFT;
        const isRtl = this.gos.get('enableRtl');
        let nextHeader: HeaderPosition;
        let normalisedDirection: 'Before' | 'After';

        // either navigating to the left or isRtl (cannot be both)
        if (this.currentHeaderRowWithoutSpan !== -1) {
            focusedHeader.headerRowIndex = this.currentHeaderRowWithoutSpan;
        } else {
            this.currentHeaderRowWithoutSpan = focusedHeader.headerRowIndex;
        }

        if (isLeft !== isRtl) {
            normalisedDirection = 'Before';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, normalisedDirection)!;
        } else {
            normalisedDirection = 'After';
            nextHeader = this.headerPositionUtils.findHeader(focusedHeader, normalisedDirection)!;
        }

        if (nextHeader || !fromTab) {
            return this.focusService.focusHeaderPosition({
                headerPosition: nextHeader,
                direction: normalisedDirection,
                fromTab,
                allowUserOverride: true,
                event,
            });
        } else if (fromTab) {
            const userFunc = this.gos.getCallback('tabToNextHeader');
            if (userFunc) {
                return this.focusService.focusHeaderPositionFromUserFunc({
                    userFunc,
                    headerPosition: nextHeader,
                    direction: normalisedDirection,
                });
            }
        }

        return this.focusNextHeaderRow(focusedHeader, normalisedDirection, event);
    }

    private focusNextHeaderRow(
        focusedHeader: HeaderPosition,
        direction: 'Before' | 'After',
        event: KeyboardEvent
    ): boolean {
        const currentIndex = focusedHeader.headerRowIndex;
        let nextPosition: HeaderPosition | null = null;
        let nextRowIndex: number;

        if (direction === 'Before') {
            if (currentIndex > 0) {
                nextRowIndex = currentIndex - 1;
                this.currentHeaderRowWithoutSpan -= 1;
                nextPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'end')!;
            }
        } else {
            nextRowIndex = currentIndex + 1;
            if (this.currentHeaderRowWithoutSpan < this.getHeaderRowCount()) {
                this.currentHeaderRowWithoutSpan += 1;
            } else {
                this.setCurrentHeaderRowWithoutSpan(-1);
            }
            nextPosition = this.headerPositionUtils.findColAtEdgeForHeaderRow(nextRowIndex, 'start')!;
        }

        if (!nextPosition) {
            return false;
        }

        const { column, headerRowIndex } = this.headerPositionUtils.getHeaderIndexToFocus(
            nextPosition.column as AgColumn,
            nextPosition?.headerRowIndex
        );

        return this.focusService.focusHeaderPosition({
            headerPosition: { column, headerRowIndex },
            direction,
            fromTab: true,
            allowUserOverride: true,
            event,
        });
    }

    public scrollToColumn(column: AgColumn | AgColumnGroup, direction: 'Before' | 'After' | null = 'After'): void {
        if (column.getPinned()) {
            return;
        }

        let columnToScrollTo: AgColumn;

        if (isColumnGroup(column)) {
            const columns = column.getDisplayedLeafColumns();
            columnToScrollTo = direction === 'Before' ? _last(columns) : columns[0];
        } else {
            columnToScrollTo = column;
        }

        this.gridBodyCon.getScrollFeature().ensureColumnVisible(columnToScrollTo);
    }
}
