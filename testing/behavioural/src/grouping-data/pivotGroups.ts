import type { GridApi } from 'ag-grid-community';

/** Each distinct pivot result column group in column order: its id, header path, whether it is open and can open. */
export function pivotGroups(api: GridApi): { id: string; path: string; open: boolean; expandable: boolean }[] {
    const result: { id: string; path: string; open: boolean; expandable: boolean }[] = [];
    const seen = new Set<unknown>();
    for (const column of api.getPivotResultColumns() ?? []) {
        const groups = [];
        for (let group = column.getParent(); group; group = group.getParent()) {
            if (!group.isPadding()) {
                groups.unshift(group.getProvidedColumnGroup());
            }
        }
        let path = '';
        for (const group of groups) {
            const headerName = group.getColGroupDef()?.headerName ?? '';
            path = path ? `${path} > ${headerName}` : headerName;
            if (!seen.has(group)) {
                seen.add(group);
                result.push({
                    id: group.getGroupId(),
                    path,
                    open: group.isExpanded(),
                    expandable: group.isExpandable(),
                });
            }
        }
    }
    return result;
}
