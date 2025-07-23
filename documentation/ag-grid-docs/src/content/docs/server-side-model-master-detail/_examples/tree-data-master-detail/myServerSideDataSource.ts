import type { IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';

import { fakeData } from './data';

export interface TreeNode {
    id: number | string;
    name: string;
    jobTitle?: string;
    employmentType?: string;
    calls?: number;
    totalDuration?: number;
    projects?: { project: string; duration: string }[];
    children?: TreeNode[];
}

export class MyServerSideDatasource implements IServerSideDatasource {
    getRows(params: IServerSideGetRowsParams<TreeNode>): void {
        console.log('[Datasource] - rows requested by grid: ', params.request);

        // For tree data, groupKeys is the path to the node whose children are requested
        const results = getChildrenForNodePath(params.request.groupKeys, fakeData);

        // call the success callback
        params.success({ rowData: results, rowCount: results.length });
    }
}

// Traverse the tree and return children for the requested node path (groupKeys)
function getChildrenForNodePath(nodePath: (string | number)[], data: TreeNode[]): TreeNode[] {
    if (!nodePath || nodePath.length === 0) {
        return data;
    }
    const key = nodePath[0];
    for (let i = 0; i < data.length; i++) {
        if (String(data[i].id) === String(key)) {
            if (nodePath.length === 1) {
                return data[i].children || [];
            } else {
                return getChildrenForNodePath(nodePath.slice(1), data[i].children || []);
            }
        }
    }
    return [];
}
