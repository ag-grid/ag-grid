import type { LocaleTextFunc } from 'ag-stack';

import type {
    AbstractHeaderCellCtrl,
    AgColumn,
    AgColumnGroup,
    AgProvidedColumnGroup,
    BeanCollection,
    ColumnEventType,
    MenuItemDef,
} from 'ag-grid-community';
import { _createIconNoSpan, _getDomData } from 'ag-grid-community';

export const getColumnMenuHeaderCtrl = (
    beans: BeanCollection,
    sourceElement?: HTMLElement
): AbstractHeaderCellCtrl | undefined => {
    const headerElement = sourceElement?.closest<HTMLElement>('.ag-header-cell, .ag-header-group-cell');
    return headerElement ? _getDomData(beans.gos, headerElement, 'headerCtrl') : undefined;
};

export const getColumnMoveMenuItem = (
    beans: BeanCollection,
    column: AgColumn | null,
    columnGroup: AgProvidedColumnGroup | null,
    sourceElement: HTMLElement,
    source: ColumnEventType,
    key: 'moveLeft' | 'moveRight',
    translate: LocaleTextFunc
): MenuItemDef | null => {
    const { colMoves, gos, focusSvc, ctrlsSvc } = beans;
    const headerCtrl = getColumnMenuHeaderCtrl(beans, sourceElement);
    const headerColumn = headerCtrl?.column;
    if (!colMoves || !headerCtrl || !headerColumn || (!column && !columnGroup)) {
        return null;
    }

    const headerRowIndex = headerCtrl.rowCtrl.rowIndex;
    const before = (key === 'moveLeft') !== gos.get('enableRtl');
    const getMove = () => {
        const leaves = headerColumn.isColumn ? [headerColumn] : headerColumn.getLeafColumns();
        const order = beans.colModel.colsList.filter((col) => col.pinned === leaves[0]?.pinned);
        const movingIndexes = order.flatMap((col, index) => (leaves.includes(col) ? [index] : []));
        if (!movingIndexes.length) {
            return null;
        }
        let first = movingIndexes[0];
        let last = movingIndexes[movingIndexes.length - 1];
        const groupLeaves = headerColumn.isColumn ? leaves : headerColumn.getProvidedColumnGroup().getLeafColumns();
        if (!headerColumn.isColumn) {
            // Include hidden children in this split instance, without pulling in another instance of the group.
            while (first > 0 && groupLeaves.includes(order[first - 1])) {
                first--;
            }
            while (last + 1 < order.length && groupLeaves.includes(order[last + 1])) {
                last++;
            }
        }
        const columns = order.slice(first, last + 1).filter((col) => groupLeaves.includes(col));
        const step = before ? -1 : 1;
        const edge = before ? first : last;
        let crossedVisibleColumn = false;
        for (let index = edge + step; index >= 0 && index < order.length; index += step) {
            crossedVisibleColumn ||= order[index].displayed;
            if (!crossedVisibleColumn) {
                continue;
            }
            const target = colMoves.getColumnMoveTarget(columns, [order[index]], before);
            if (target) {
                return target;
            }
        }
        return null;
    };

    return {
        name: translate(key, key === 'moveLeft' ? 'Move Left' : 'Move Right'),
        icon: _createIconNoSpan(key === 'moveLeft' ? 'menuMoveLeft' : 'menuMoveRight', beans, column),
        disabled: !getMove(),
        action: () => {
            const move = getMove();
            if (!move) {
                return;
            }
            colMoves.moveColumns(move.columns, move.toIndex, source);
            const anchor = move.columns.find((col) => col.isVisible());
            if (!anchor) {
                return;
            }
            ctrlsSvc.getScrollFeature().ensureColumnVisible(anchor, 'auto');
            let focusColumn: AgColumn | AgColumnGroup = anchor;
            if (!headerColumn.isColumn) {
                let parent = anchor.parent;
                while (parent && parent.getGroupId() !== headerColumn.getGroupId()) {
                    parent = parent.parent;
                }
                focusColumn = parent ?? anchor;
            }
            focusSvc.focusHeaderPosition({
                headerPosition: {
                    headerRowIndex,
                    column: focusColumn,
                },
            });
        },
    };
};
