import { ColDef } from '../entities/colDef';
import { ColumnGroup } from '../entities/columnGroup';
import { ProvidedColumnGroup } from '../entities/providedColumnGroup';
import { IHeaderColumn } from '../interfaces/iHeaderColumn';
import { IProvidedColumn } from '../interfaces/iProvidedColumn';
import { attrToNumber } from '../utils/generic';

export function calculateColMinWidth(colDef: ColDef, getDefault: () => number): number {
    return colDef.minWidth ?? getDefault();
}

export function calculateColMaxWidth(colDef: ColDef): number {
    return colDef.maxWidth ?? Number.MAX_SAFE_INTEGER;
}

export function calculateColInitialWidth(colDef: ColDef, getDefault: () => number): number {
    const minColWidth = calculateColMinWidth(colDef, getDefault);
    const maxColWidth = calculateColMaxWidth(colDef);

    let width: number;
    const colDefWidth = attrToNumber(colDef.width);
    const colDefInitialWidth = attrToNumber(colDef.initialWidth);

    if (colDefWidth != null) {
        width = colDefWidth;
    } else if (colDefInitialWidth != null) {
        width = colDefInitialWidth;
    } else {
        width = 200;
    }

    return Math.max(Math.min(width, maxColWidth), minColWidth);
}

export function depthFirstOriginalTreeSearch(
    parent: ProvidedColumnGroup | null,
    tree: IProvidedColumn[],
    callback: (treeNode: IProvidedColumn, parent: ProvidedColumnGroup | null) => void
): void {
    if (!tree) {
        return;
    }

    for (let i = 0; i < tree.length; i++) {
        const child = tree[i];
        if (child instanceof ProvidedColumnGroup) {
            depthFirstOriginalTreeSearch(child, child.getChildren(), callback);
        }
        callback(child, parent);        
    }
}

export function depthFirstAllColumnTreeSearch(
    tree: IHeaderColumn[] | null,
    callback: (treeNode: IHeaderColumn) => void
): void {
    if (!tree) {
        return;
    }

    for (let i = 0; i < tree.length; i++) {
        const child = tree[i];
        if (child instanceof ColumnGroup) {
            depthFirstAllColumnTreeSearch(child.getChildren(), callback);
        }
        callback(child);
    }
}

export function depthFirstDisplayedColumnTreeSearch(
    tree: IHeaderColumn[] | null,
    callback: (treeNode: IHeaderColumn) => void
): void {
    if (!tree) {
        return;
    }

    for (let i = 0; i < tree.length; i++) {
        const child = tree[i];
        if (child instanceof ColumnGroup) {
            depthFirstDisplayedColumnTreeSearch(child.getDisplayedChildren(), callback);
        }
        callback(child);
    }
}
