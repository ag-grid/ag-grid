import { depthFirstOriginalTreeSearch } from '../columns/columnFactoryUtils';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { GridOptionsService } from '../gridOptionsService';

export function placeLockedColumns(cols: AgColumn[], gos: GridOptionsService): AgColumn[] {
    // Quick check: if no columns have lockPosition, return the input directly
    let hasLocked = false;
    for (let i = 0, len = cols.length; i < len; ++i) {
        if (cols[i].getColDef().lockPosition) {
            hasLocked = true;
            break;
        }
    }
    if (!hasLocked) {
        return cols;
    }

    const isRtl = gos.get('enableRtl');
    // Single pass: partition into head/normal/tail, then concatenate in-place
    const head: AgColumn[] = [];
    const normal: AgColumn[] = [];
    const tail: AgColumn[] = [];
    for (let i = 0, len = cols.length; i < len; ++i) {
        const col = cols[i];
        const position = col.getColDef().lockPosition;
        if (position === 'right') {
            (isRtl ? head : tail).push(col);
        } else if (position === 'left' || position === true) {
            (isRtl ? tail : head).push(col);
        } else {
            normal.push(col);
        }
    }

    const result = new Array<AgColumn>(head.length + normal.length + tail.length);
    let pos = 0;
    for (let i = 0, len = head.length; i < len; ++i) {
        result[pos++] = head[i];
    }
    for (let i = 0, len = normal.length; i < len; ++i) {
        result[pos++] = normal[i];
    }
    for (let i = 0, len = tail.length; i < len; ++i) {
        result[pos++] = tail[i];
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
