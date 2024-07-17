import type { IRowNode } from '@ag-grid-community/core';

function getRowKey<TData = any>(row: IRowNode<TData> | undefined): string | undefined {
    return row ? row.key : undefined;
}

export function rowSnapshot<TData = any>(row: IRowNode<TData>) {
    const {
        allChildrenCount,
        allLeafChildren,
        childIndex,
        childrenAfterFilter,
        childrenAfterGroup,
        childrenAfterSort,
        detail,
        displayed,
        expanded,
        firstChild,
        footer,
        group,
        id,
        key,
        lastChild,
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
        allLeafChildren: allLeafChildren?.map(getRowKey),
        childIndex,
        childrenAfterFilter: childrenAfterFilter?.map(getRowKey),
        childrenAfterGroup: childrenAfterGroup?.map(getRowKey),
        childrenAfterSort: childrenAfterSort?.map(getRowKey),
        detail,
        displayed,
        expanded,
        firstChild,
        footer,
        group,
        id,
        key,
        lastChild,
        leafGroup,
        level,
        master,
        parentKey: getRowKey(parent),
        rowGroupIndex,
        rowPinned,
        selectable,
        siblingIndex: getRowKey(sibling),
        uiLevel,
        rowIndex,
    };
}

export type RowSnapshot<TData = any> = ReturnType<typeof rowSnapshot<TData>>;

export function generateRowSnapshots<TData>(data: TData[], getDataPath: (data: TData) => string[]): RowSnapshot[] {
    const result: RowSnapshot[] = [];
    let rowIndex = 0;

    for (let parentIndex = 0; parentIndex < data.length; ++parentIndex) {
        const row = data[parentIndex];
        const hierarchy = getDataPath(row);

        for (let childIndex = 0; childIndex < hierarchy.length; ++childIndex) {
            const leafIndex = hierarchy.length - 1;
            const key = hierarchy[childIndex];
            const isGroup = childIndex < leafIndex;
            const allChildrenCount = isGroup ? leafIndex - childIndex : null;
            const allLeafChildren = isGroup ? [hierarchy[leafIndex]] : [];
            const level = childIndex;
            const uiLevel = childIndex;
            const parentKey = childIndex === 0 ? null : hierarchy[childIndex - 1];

            result.push({
                rowIndex: rowIndex,
                key,
                id: isGroup
                    ? `row-group-${parentIndex}-${hierarchy.slice(0, childIndex + 1).join('-')}`
                    : rowIndex.toString(),
                master: isGroup ? undefined : false,
                expanded: true,
                selectable: true,
                rowPinned: undefined,
                group: isGroup,
                footer: undefined,
                displayed: true,
                detail: undefined,
                leafGroup: isGroup ? false : undefined,
                firstChild: true,
                lastChild: childIndex === leafIndex,
                level,
                uiLevel,
                rowGroupIndex: null,
                parentKey: parentKey,
                siblingIndex: undefined,
                childIndex: childIndex,
                allChildrenCount: allChildrenCount,
                allLeafChildren: allLeafChildren,
                childrenAfterGroup: isGroup ? [hierarchy[childIndex + 1]] : [],
                childrenAfterSort: isGroup ? [hierarchy[childIndex + 1]] : [],
                childrenAfterFilter: isGroup ? [hierarchy[childIndex + 1]] : [],
            });

            rowIndex++;
        }
    }

    return result;
}
