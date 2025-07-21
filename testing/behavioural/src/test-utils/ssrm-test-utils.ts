import type { GridApi } from 'ag-grid-community';

import { asyncSetTimeout } from './utils';

export function countLoadingRows(api: GridApi): number {
    let loadingRows = 0;
    api.forEachNode((node) => {
        if (node.id === undefined && !node.data) {
            ++loadingRows;
        }
    }, false);
    return loadingRows;
}

export function waitForNoLoadingRows(api: GridApi): Promise<boolean> {
    let didLoad = false;
    return new Promise((resolve) => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        const checkNoLoadingTimer = () => {
            timer = null;
            checkNoLoadingRows();
        };
        const checkNoLoadingRows = () => {
            if (countLoadingRows(api) === 0) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                api.removeEventListener('modelUpdated', checkNoLoadingRows);
                resolve(didLoad);
                return true;
            }
            didLoad = true;
            timer ??= setTimeout(checkNoLoadingTimer, 2);
            return false;
        };
        if (!checkNoLoadingRows()) {
            api.addEventListener('modelUpdated', checkNoLoadingRows);
        }
    });
}

export async function ssrmExpandAndLoadAll(api: GridApi) {
    function expandAllGroupsFromNodes() {
        let result = false;
        api.forEachNode((node) => {
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

        if (await waitForNoLoadingRows(api)) {
            continue;
        }

        break;
    }
}
