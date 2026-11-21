import type { IRowNode } from 'ag-grid-community';

function getRowKey<TData = any>(row: IRowNode<TData> | null | undefined): string | null | undefined {
    return row ? row.key : undefined;
}

const mapArray = <T, U>(array: T[] | null | undefined, mapFn: (item: T) => U): U[] | null | undefined =>
    Array.isArray(array) ? array.map(mapFn) : array;

export function getRowSnapshot<TData = any>(row: IRowNode<TData>) {
    const {
        allChildrenCount,
        allLeafChildren,
        childrenAfterFilter,
        childrenAfterGroup,
        childrenAfterSort,
        detail,
        displayed,
        expanded,
        footer,
        group,
        groupData,
        id,
        key,
        leafGroup,
        level,
        master,
        parent,
        rowGroupIndex,
        rowPinned,
        selectable,
        sibling,
        uiLevel,
        rowIndex,
    } = row;

    return {
        allChildrenCount,
        allLeafChildren: mapArray(allLeafChildren, getRowKey),
        childrenAfterFilter: mapArray(childrenAfterFilter, getRowKey),
        childrenAfterGroup: mapArray(childrenAfterGroup, getRowKey),
        childrenAfterSort: mapArray(childrenAfterSort, getRowKey),
        detail,
        displayed,
        expanded,
        footer,
        group,
        groupData: groupData as typeof groupData | undefined,
        id,
        key,
        leafGroup,
        level,
        master: master as typeof master | undefined,
        parentKey: getRowKey(parent),
        rowGroupIndex: rowGroupIndex as typeof rowGroupIndex | undefined,
        rowPinned,
        selectable,
        siblingKey: getRowKey(sibling),
        uiLevel,
        rowIndex,
    };
}

export function getRowsSnapshot(rows: IRowNode[]) {
    return mapArray(rows, getRowSnapshot);
}

export type RowSnapshot<TData = any> = ReturnType<typeof getRowSnapshot<TData>>;
