// This fake server mimics a real server for AG Grid's Server-Side Row Model with tree data + master detail.
// It simply traverses the tree and returns the correct children for the requested node.

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

export interface FakeServerRequest {
    groupKeys: (string | number)[];
}

export interface FakeServerResult {
    success: boolean;
    rows: TreeNode[];
    lastRow: number;
}

export function FakeServer(allData: TreeNode[]): {
    getData: (request: FakeServerRequest) => FakeServerResult;
} {
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

    return {
        getData: function (request: FakeServerRequest): FakeServerResult {
            // For tree data, groupKeys is the path to the node whose children are requested
            const results = getChildrenForNodePath(request.groupKeys, allData);
            return {
                success: true,
                rows: results,
                lastRow: results.length,
            };
        },
    };
}
