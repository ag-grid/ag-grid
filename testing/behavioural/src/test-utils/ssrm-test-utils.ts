import type { GridApi } from 'ag-grid-community';

import { asyncSetTimeout } from './utils';

export function countLoadingRows(api: GridApi): number {
    if (api.isDestroyed?.()) {
        return 0;
    }
    let loadingRows = 0;
    api.forEachNode?.((node) => {
        if (node.id === undefined && !node.data) {
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
    function expandAllGroupsFromNodes() {
        if (api.isDestroyed?.()) {
            return false;
        }
        let result = false;
        api.forEachNode?.((node) => {
            if ((node.group || node.master || node.isExpandable()) && !node.expanded) {
                node.setExpanded(true);
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

        if (countLoadingRows(api) > 0) {
            await asyncSetTimeout(1);
            continue;
        }

        break;
    }
}
