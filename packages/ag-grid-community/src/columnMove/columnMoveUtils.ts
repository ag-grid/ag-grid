import { depthFirstOriginalTreeSearch } from '../columns/columnFactoryUtils';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { GridOptionsService } from '../gridOptionsService';

export function placeLockedColumns(cols: AgColumn[], gos: GridOptionsService): AgColumn[] {
    // Fast path: most grids have no locked cols — return the input unchanged, no allocation.
    let hasLocked = false;
    for (let i = 0, len = cols.length; i < len; ++i) {
        const pos = cols[i].colDef.lockPosition;
        if (pos != null && pos !== false) {
            hasLocked = true;
            break;
        }
    }
    if (!hasLocked) {
        return cols;
    }

    const left: AgColumn[] = [];
    const normal: AgColumn[] = [];
    const right: AgColumn[] = [];
    for (let i = 0, len = cols.length; i < len; ++i) {
        const col = cols[i];
        const position = col.colDef.lockPosition;
        if (position === 'right') {
            right.push(col);
        } else if (position === 'left' || position === true) {
            left.push(col);
        } else {
            normal.push(col);
        }
    }

    const isRtl = gos.get('enableRtl');
    const leftLen = left.length;
    const normalLen = normal.length;
    const rightLen = right.length;
    const result = new Array<AgColumn>(leftLen + normalLen + rightLen);
    let pos = 0;
    if (isRtl) {
        for (let i = 0; i < rightLen; ++i) {
            result[pos++] = right[i];
        }
        for (let i = 0; i < normalLen; ++i) {
            result[pos++] = normal[i];
        }
        for (let i = 0; i < leftLen; ++i) {
            result[pos++] = left[i];
        }
    } else {
        for (let i = 0; i < leftLen; ++i) {
            result[pos++] = left[i];
        }
        for (let i = 0; i < normalLen; ++i) {
            result[pos++] = normal[i];
        }
        for (let i = 0; i < rightLen; ++i) {
            result[pos++] = right[i];
        }
    }
    return result;
}

export function doesMovePassMarryChildren(
    allColumnsCopy: AgColumn[],
    gridBalancedTree: (AgColumn | AgProvidedColumnGroup)[]
): boolean {
    let rulePassed = true;

    depthFirstOriginalTreeSearch(null, gridBalancedTree, (child) => {
        if (!isProvidedColumnGroup(child)) {
            return;
        }

        const columnGroup = child;
        const colGroupDef = columnGroup.getColGroupDef();
        const marryChildren = colGroupDef?.marryChildren;

        if (!marryChildren) {
            return;
        }

        const newIndexes: number[] = [];
        for (const col of columnGroup.getLeafColumns()) {
            const newColIndex = allColumnsCopy.indexOf(col);
            newIndexes.push(newColIndex);
        }

        // eslint-disable-next-line prefer-spread
        const maxIndex = Math.max.apply(Math, newIndexes);
        // eslint-disable-next-line prefer-spread
        const minIndex = Math.min.apply(Math, newIndexes);

        // spread is how far the first column in this group is away from the last column
        const spread = maxIndex - minIndex;
        const maxSpread = columnGroup.getLeafColumns().length - 1;

        // if the columns
        if (spread > maxSpread) {
            rulePassed = false;
        }
    });

    return rulePassed;
}
