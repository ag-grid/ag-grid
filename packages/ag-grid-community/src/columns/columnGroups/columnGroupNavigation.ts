import type { AgColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import { edgeLeafColumn } from '../../entities/agColumnGroup';
import type { VisibleColsService } from '../visibleColsService';

/** Walk up `column`'s parent chain to the group sitting at header-row `level`. */
export function getColGroupAtLevel(column: AgColumn, level: number): AgColumnGroup | null {
    // Decrement `paddingLevel` inline on each parent step.
    let groupPointer: AgColumnGroup = column.parent!;
    let paddingLevel = groupPointer.getPaddingLevel();
    while (groupPointer.providedColumnGroup.level + paddingLevel > level) {
        groupPointer = groupPointer.parent!;
        paddingLevel = paddingLevel > 0 ? paddingLevel - 1 : 0;
    }
    return groupPointer;
}

/** Scan leaf-by-leaf from `columnGroup`'s edge to the adjacent displayed group at the same level. */
export function getColGroupAtDirection(
    visibleCols: VisibleColsService,
    columnGroup: AgColumnGroup,
    direction: 'After' | 'Before'
): AgColumnGroup | null {
    const requiredLevel = columnGroup.providedColumnGroup.level + columnGroup.getPaddingLevel();
    const isAfter = direction === 'After';
    let col = edgeLeafColumn(columnGroup, true, isAfter);
    while (col) {
        const column = isAfter ? visibleCols.getColAfter(col) : visibleCols.getColBefore(col);
        if (!column) {
            return null;
        }
        const groupPointer = getColGroupAtLevel(column, requiredLevel);
        if (groupPointer !== columnGroup) {
            return groupPointer;
        }
        col = column;
    }
    return null;
}
