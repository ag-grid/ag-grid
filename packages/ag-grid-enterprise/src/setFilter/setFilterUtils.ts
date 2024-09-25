import { _last, _makeNull, _toStringOrNull } from 'ag-grid-community';

export function processDataPath(
    dataPath: string[] | null,
    treeData: boolean,
    groupAllowUnbalanced: boolean
): (string | null)[] | null {
    let processedDataPath: (string | null)[] | null = dataPath;
    if (!processedDataPath) {
        return null;
    }

    processedDataPath = processedDataPath.map((treeKey) => _toStringOrNull(_makeNull(treeKey)));

    // leave `null`s in the path unless unbalanced groups
    if (!treeData && groupAllowUnbalanced && processedDataPath.some((treeKey) => treeKey == null)) {
        if (_last(processedDataPath) == null) {
            return null;
        }
        return processedDataPath.filter((treeKey) => treeKey != null);
    }
    return processedDataPath;
}
