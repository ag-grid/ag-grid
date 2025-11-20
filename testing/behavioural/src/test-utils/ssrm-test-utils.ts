import type { GridApi, IRowNode } from 'ag-grid-community';

import { asyncSetTimeout } from './utils';

export function countLoadingRows(api: GridApi): number {
    if (api.isDestroyed?.()) {
        return 0;
    }
    let loadingRows = 0;
    api.forEachNode?.((node) => {
        if (node.stub) {
            ++loadingRows;
        }
    }, false);
    return loadingRows;
}

export async function waitForNoLoadingRows(api: GridApi) {
    await asyncSetTimeout(0);
    while (countLoadingRows(api) > 0) {
        await asyncSetTimeout(1);
    }
}

export async function ssrmExpandAndLoadAll(api: GridApi) {
    const visited = new Set<IRowNode | string | undefined>();
    function expandAllGroupsFromNodes() {
        if (api.isDestroyed?.()) {
            return false;
        }
        let result = false;
        api.forEachNode?.((node) => {
            if (api.isDestroyed?.() || node.stub) {
                return;
            }
            if (visited.has(node) || visited.has(node.id)) {
                return;
            }
            visited.add(node);
            if (node.id != null) {
                visited.add(node.id);
            }
            if ((node.group || node.master || node.isExpandable()) && !node.expanded) {
                node.setExpanded(true, undefined, true);
                result = true;
            }
        }, false);
        return result;
    }

    while (true) {
        if (expandAllGroupsFromNodes()) {
            await asyncSetTimeout(1);
            continue;
        }

        const loading = countLoadingRows(api);
        if (loading > 0) {
            await asyncSetTimeout(1);
            continue;
        }

        break;
    }
}
