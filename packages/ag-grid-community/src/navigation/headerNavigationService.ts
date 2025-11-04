import { _last } from '../agStack/utils/array';
import { _getDocument } from '../agStack/utils/document';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { AgColumn } from '../entities/agColumn';
import { AgColumnGroup, isColumnGroup } from '../entities/agColumnGroup';
import type { GridBodyCtrl } from '../gridBodyComp/gridBodyCtrl';
import { getFocusHeaderRowCount } from '../headerRendering/headerUtils';
import type { HeaderRowType } from '../headerRendering/row/headerRowComp';
import type { Column, ColumnGroup } from '../interfaces/iColumn';
import type { HeaderPosition } from '../interfaces/iHeaderPosition';

export type HeaderNavigationDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface HeaderFuturePosition extends HeaderPosition {
    headerRowIndexWithoutSpan?: number;
}

/**
 * @returns a header position to focus at the level provided.
 */
export function getHeaderIndexToFocus(beans: BeanCollection, column: AgColumn, level: number): HeaderPosition {
    const columnRowIndex = beans.visibleCols.headerGroupRowCount;
    // if level is greater or equal to the column row index, then it's filters or col and needs to be supplied this col.
    if (level >= columnRowIndex) {
        return {
            column,
            headerRowIndex: level,
        };
    }

    // if level is less, then find the group with the given level
    let parent = column.getParent();
    while (parent && parent.getProvidedColumnGroup().getLevel() > level) {
        parent = parent.getParent();
    }

    const isColSpanning = column.isSpanHeaderHeight();
    // if no parent or found a padding group which should be spanned, return the column and column the level
    if (!parent || (isColSpanning && parent.isPadding())) {
        return {
            column,
            headerRowIndex: columnRowIndex,
        };
    }

    // if found a group, return the parent and the level
    return {
        column: parent,
        headerRowIndex: parent.getProvidedColumnGroup().getLevel(),
    };
}

export class HeaderNavigationService extends BeanStub implements NamedBean {
    beanName = 'headerNavigation' as const;

    private gridBodyCon: GridBodyCtrl;
    public currentHeaderRowWithoutSpan: number = -1;

    public postConstruct(): void {
        const beans = this.beans;
        beans.ctrlsSvc.whenReady(this, (p) => {
            this.gridBodyCon = p.gridBodyCtrl;
        });

        const eDocument = _getDocument(beans);
        this.addManagedElementListeners(eDocument, {
            mousedown: () => {
                this.currentHeaderRowWithoutSpan = -1;
            },
        });
    }

    public getHeaderPositionForColumn(
        colKey: string | Column | ColumnGroup,
        floatingFilter: boolean
    ): HeaderPosition | null {
        let column: AgColumn | AgColumnGroup | null;

        const { colModel, colGroupSvc, ctrlsSvc } = this.beans;

        if (typeof colKey === 'string') {
            column = colModel.getCol(colKey);
            if (!column) {
                column = colGroupSvc?.getColumnGroup(colKey) ?? null;
            }
        } else {
            column = colKey as AgColumn | AgColumnGroup;
        }

        if (!column) {
            return null;
        }

        const centerHeaderContainer = ctrlsSvc.getHeaderRowContainerCtrl();
        const allCtrls = centerHeaderContainer?.getAllCtrls();
        const isFloatingFilterVisible = _last(allCtrls || []).type === 'filter';
        const headerRowCount = getFocusHeaderRowCount(this.beans) - 1;

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
    public navigateVertically(direction: HeaderNavigationDirection, event: KeyboardEvent): boolean {
        const { focusSvc, visibleCols } = this.beans;
        const { focusedHeader } = focusSvc;

        if (!focusedHeader) {
            return false;
        }

        const { headerRowIndex } = focusedHeader;
        const column = focusedHeader.column as AgColumn;
        const rowLen = getFocusHeaderRowCount(this.beans);
        const currentRowType = this.getHeaderRowType(headerRowIndex);
        const columnHeaderRowIndex = visibleCols.headerGroupRowCount;

        let {
            headerRowIndex: nextRow,
            column: nextFocusColumn,
            headerRowIndexWithoutSpan,
        } = direction === 'UP'
            ? getColumnVisibleParent(currentRowType, column, headerRowIndex)
            : getColumnVisibleChild(column, headerRowIndex, columnHeaderRowIndex);

        let skipColumn = false;

        if (nextRow < 0) {
            nextRow = 0;
            nextFocusColumn = column;
            skipColumn = true;
        }

        if (nextRow >= rowLen) {
            nextRow = -1; // -1 indicates the focus should move to grid rows.
            this.currentHeaderRowWithoutSpan = -1;
        } else if (headerRowIndexWithoutSpan !== undefined) {
            this.currentHeaderRowWithoutSpan = headerRowIndexWithoutSpan;
        }

        if (!skipColumn && !nextFocusColumn) {
            return false;
        }

        return focusSvc.focusHeaderPosition({
            headerPosition: { headerRowIndex: nextRow, column: nextFocusColumn },
            allowUserOverride: true,
            event,
        });
    }

    /*
     * This method navigates grid header horizontally
     * @returns {boolean} true to preventDefault on the event that caused this navigation.
     */
    public navigateHorizontally(
        direction: HeaderNavigationDirection,
        fromTab: boolean = false,
        event: KeyboardEvent
    ): boolean {
        const { focusSvc, gos } = this.beans;
        const focusedHeader = { ...focusSvc.focusedHeader! };
        let nextHeader: HeaderPosition;
        let normalisedDirection: 'Before' | 'After';

        // either navigating to the left or isRtl (cannot be both)
        if (this.currentHeaderRowWithoutSpan !== -1) {
            focusedHeader.headerRowIndex = this.currentHeaderRowWithoutSpan;
        } else {
            this.currentHeaderRowWithoutSpan = focusedHeader.headerRowIndex;
        }

        if ((direction === 'LEFT') !== gos.get('enableRtl')) {
            normalisedDirection = 'Before';
            nextHeader = this.findHeader(focusedHeader, normalisedDirection)!;
        } else {
            normalisedDirection = 'After';
            nextHeader = this.findHeader(focusedHeader, normalisedDirection)!;
        }

        const userFunc = gos.getCallback('tabToNextHeader');

        if (fromTab && userFunc) {
            const wasFocusedFromUserFunc = focusSvc.focusHeaderPositionFromUserFunc({
                userFunc,
                headerPosition: nextHeader,
                direction: normalisedDirection,
            });

            // the user could have forced a change in rowHeaderIndex
            if (wasFocusedFromUserFunc) {
                const { headerRowIndex } = focusSvc.focusedHeader || {};
                if (headerRowIndex != null && headerRowIndex != focusedHeader.headerRowIndex) {
                    this.currentHeaderRowWithoutSpan = headerRowIndex;
                }
            }

            return wasFocusedFromUserFunc;
        }

        if (nextHeader || !fromTab) {
            return focusSvc.focusHeaderPosition({
                headerPosition: nextHeader,
                direction: normalisedDirection,
                fromTab,
                allowUserOverride: true,
                event,
            });
        }

        return this.focusNextHeaderRow(focusedHeader, normalisedDirection, event);
    }

    private focusNextHeaderRow(
        focusedHeader: HeaderPosition,
        direction: 'Before' | 'After',
        event: KeyboardEvent
    ): boolean {
        const beans = this.beans;
        const currentIndex = focusedHeader.headerRowIndex;

        let nextFocusedCol: AgColumn | null = null;
        let nextRowIndex: number;

        const headerRowCount = getFocusHeaderRowCount(beans);
        const allVisibleCols = this.beans.visibleCols.allCols;
        if (direction === 'Before') {
            if (currentIndex <= 0) {
                return false; // no previous row to focus
            }
            nextFocusedCol = _last(allVisibleCols);
            nextRowIndex = currentIndex - 1;
            this.currentHeaderRowWithoutSpan -= 1;
        } else {
            nextFocusedCol = allVisibleCols[0];
            nextRowIndex = currentIndex + 1;
            if (this.currentHeaderRowWithoutSpan < headerRowCount) {
                this.currentHeaderRowWithoutSpan += 1;
            } else {
                this.currentHeaderRowWithoutSpan = -1;
            }
        }

        let { column, headerRowIndex } = getHeaderIndexToFocus(this.beans, nextFocusedCol, nextRowIndex);
        // if index is greater than the header row count, then row -1 to move to next container
        if (headerRowIndex >= headerRowCount) {
            headerRowIndex = -1;
        }

        return beans.focusSvc.focusHeaderPosition({
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

        this.gridBodyCon.scrollFeature.ensureColumnVisible(columnToScrollTo);
    }

    private findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined {
        const { colGroupSvc, visibleCols } = this.beans;

        let currentFocusedColumn = focusedHeader.column as AgColumn | AgColumnGroup;
        if (currentFocusedColumn instanceof AgColumnGroup) {
            const leafChildren = currentFocusedColumn.getDisplayedLeafColumns();
            currentFocusedColumn = direction === 'Before' ? leafChildren[0] : leafChildren[leafChildren.length - 1];
        }

        const nextFocusedCol =
            direction === 'Before'
                ? visibleCols.getColBefore(currentFocusedColumn)
                : visibleCols.getColAfter(currentFocusedColumn);
        if (!nextFocusedCol) {
            return undefined;
        }

        const headerGroupRowIndex = visibleCols.headerGroupRowCount;
        if (focusedHeader.headerRowIndex >= headerGroupRowIndex) {
            return {
                headerRowIndex: focusedHeader.headerRowIndex,
                column: nextFocusedCol,
            };
        }
        const groupAtLevel = colGroupSvc?.getColGroupAtLevel(nextFocusedCol, focusedHeader.headerRowIndex);
        if (!groupAtLevel) {
            // spanned or filler column
            const isSpanningCol = nextFocusedCol instanceof AgColumn && nextFocusedCol.isSpanHeaderHeight();
            return {
                headerRowIndex: isSpanningCol ? visibleCols.headerGroupRowCount : focusedHeader.headerRowIndex,
                column: nextFocusedCol,
            };
        }

        if (groupAtLevel.isPadding() && nextFocusedCol.isSpanHeaderHeight()) {
            // if the next column is a padding group, but the current column is spanning, we want to return the
            // next column at the full tree depth index to instead focus the spanned column
            return {
                headerRowIndex: visibleCols.headerGroupRowCount,
                column: nextFocusedCol,
            };
        }
        return {
            headerRowIndex: focusedHeader.headerRowIndex,
            column: groupAtLevel ?? nextFocusedCol,
        };
    }

    private getHeaderRowType(rowIndex: number): HeaderRowType | undefined {
        const centerHeaderContainer = this.beans.ctrlsSvc.getHeaderRowContainerCtrl();
        if (centerHeaderContainer) {
            return centerHeaderContainer.getRowType(rowIndex);
        }
    }
}

function getColumnVisibleParent(
    currentRowType: HeaderRowType | undefined,
    currentColumn: AgColumn | AgColumnGroup,
    currentIndex: number
): HeaderFuturePosition {
    const optimisticNextIndex = currentIndex - 1;
    if (currentRowType !== 'filter') {
        const isSpanningCol = currentColumn instanceof AgColumn && currentColumn.isSpanHeaderHeight();
        let nextVisibleParent = currentColumn.getParent();
        while (
            nextVisibleParent &&
            // skip if row isn't visible or col is padding and spanned
            (nextVisibleParent.getProvidedColumnGroup().getLevel() > optimisticNextIndex ||
                (isSpanningCol && nextVisibleParent.isPadding()))
        ) {
            nextVisibleParent = nextVisibleParent.getParent();
        }

        if (nextVisibleParent) {
            if (isSpanningCol) {
                // if the column is spanning, we want to return the parent at the full tree depth index
                // not last row, as last row could be filter
                return {
                    column: nextVisibleParent,
                    headerRowIndex: nextVisibleParent.getProvidedColumnGroup().getLevel(),
                    headerRowIndexWithoutSpan: optimisticNextIndex,
                };
            } else {
                // if not spanning, return the parent at the optimistic next index
                return {
                    column: nextVisibleParent,
                    headerRowIndex: optimisticNextIndex,
                    headerRowIndexWithoutSpan: optimisticNextIndex,
                };
            }
        }
    }

    return {
        column: currentColumn,
        headerRowIndex: optimisticNextIndex,
        headerRowIndexWithoutSpan: optimisticNextIndex,
    };
}

function getColumnVisibleChild(
    column: AgColumn | AgColumnGroup,
    currentIndex: number,
    columnHeaderRowIndex: number
): HeaderFuturePosition {
    const optimisticNextIndex = currentIndex + 1;

    const result: HeaderFuturePosition = {
        column,
        headerRowIndex: optimisticNextIndex,
        headerRowIndexWithoutSpan: optimisticNextIndex,
    };

    // if a group, push focus into the first child
    if (column instanceof AgColumnGroup) {
        // if moving down to end of tree, get a leaf column as might be skipping
        // non-rendered padding groups.
        if (optimisticNextIndex >= columnHeaderRowIndex) {
            return {
                column: column.getDisplayedLeafColumns()[0],
                headerRowIndex: columnHeaderRowIndex,
                headerRowIndexWithoutSpan: optimisticNextIndex,
            };
        }

        const children = column.getDisplayedChildren();
        let firstChild = children![0];
        if (firstChild instanceof AgColumnGroup && firstChild.isPadding()) {
            const firstCol = firstChild.getDisplayedLeafColumns()[0];
            if (firstCol.isSpanHeaderHeight()) {
                firstChild = firstCol;
            }
        }
        result.column = firstChild;

        // if the first child is a col that is spanning, skip to the full tree depth index
        // not last row, as last row could be filter
        const isSpanningCol = firstChild instanceof AgColumn && firstChild.isSpanHeaderHeight();
        if (isSpanningCol) {
            result.headerRowIndex = columnHeaderRowIndex;
            result.headerRowIndexWithoutSpan = optimisticNextIndex;
        }
    }

    return result;
}
