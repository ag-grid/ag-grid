import type { GridApi, IRowNode } from 'ag-grid-community';

import { asyncSetTimeout } from './node-utils';

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
        // Poll-loop yield, not a guessed delay: the condition is re-read synchronously on every iteration.
        await asyncSetTimeout(0);
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
            // Fixpoint-loop yield after a mutating action: lets the datasource respond before the next
            // synchronous re-scan of the row model. Not a wait for a fixed duration.
            await asyncSetTimeout(0);
            continue;
        }

        const loading = countLoadingRows(api);
        if (loading > 0) {
            // Poll-loop yield, not a guessed delay: countLoadingRows is re-read synchronously each iteration.
            await asyncSetTimeout(0);
            continue;
        }

        break;
    }
}
