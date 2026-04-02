import type {
    BeanCollection,
    ChangedPath,
    ClientSideRowModelStage,
    FilterManager,
    GridOptions,
    NamedBean,
    RowNode,
    _IRowNodeFilterStage,
} from 'ag-grid-community';
import { BeanStub, _forEachChangedGroupDepthFirst } from 'ag-grid-community';

const syncSibling = (node: RowNode) => {
    const sibling = node.sibling;
    if (sibling) {
        sibling.childrenAfterFilter = node.childrenAfterFilter;
    }
};

const passThrough = (node: RowNode) => {
    node.childrenAfterFilter = node.childrenAfterGroup;
    syncSibling(node);
};

/** Returns true if the child should be included in filtered results. */
const passesFilter = (child: RowNode, fm: FilterManager): boolean => {
    if (child.childrenAfterFilter && child.childrenAfterFilter.length > 0) {
        return true; // has filtered children — keep the group
    }
    return !!(child.data && fm.doesRowPassFilter(child));
};

/**
 * Filters group children. Returns prev array by reference when unchanged (zero allocation).
 * Same two-phase algorithm as flat filterFlat — compare phase then build phase.
 */
const filterDeep = (rows: RowNode[], prev: RowNode[] | null, fm: FilterManager): RowNode[] => {
    const len = rows.length;
    prev ??= rows;
    const prevLen = prev.length;
    let n = 0;
    for (let i = 0; i < len; ++i) {
        const row = rows[i];
        if (passesFilter(row, fm)) {
            if (n >= prevLen || prev[n] !== row) {
                return filterDeepBuild(rows, len, i, prev, n, fm);
            }
            ++n;
        } else if (n < prevLen) {
            return filterDeepBuild(rows, len, i, prev, n, fm);
        }
    }
    return n === prevLen ? prev : rows;
};

/** Cold path: build new array from divergence point. */
const filterDeepBuild = (
    rows: RowNode[],
    len: number,
    i: number,
    prev: RowNode[],
    n: number,
    fm: FilterManager
): RowNode[] => {
    const result = n > 0 ? prev.slice(0, n) : [];
    while (i < len) {
        const row = rows[i++];
        if (passesFilter(row, fm)) {
            result.push(row);
        }
    }
    return result;
};

export class GroupFilterStage extends BeanStub implements NamedBean, _IRowNodeFilterStage {
    beanName = 'groupFilterStage' as const;

    public readonly step: ClientSideRowModelStage = 'filter';
    public readonly refreshProps: (keyof GridOptions<any>)[] = ['excludeChildrenWhenTreeDataFiltering'];

    private filterManager?: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        this.filterManager = beans.filterManager;
    }

    public execute(changedPath: ChangedPath | undefined): void {
        const fm = this.filterManager;
        if (fm?.isChildFilterPresent()) {
            if (this.doingTreeDataFiltering()) {
                this.treeDataFilter(fm);
            } else {
                this.filterActive(fm, changedPath);
            }
        } else {
            _forEachChangedGroupDepthFirst(this.beans.rowModel.rootNode, true, changedPath, passThrough);
        }
    }

    private filterActive(fm: FilterManager, changedPath: ChangedPath | undefined): void {
        const callback = (node: RowNode) => {
            const children = node.childrenAfterGroup;
            if (children) {
                node.childrenAfterFilter = filterDeep(children, node.childrenAfterFilter, fm);
            } else {
                node.childrenAfterFilter = children;
            }
            syncSibling(node);
        };
        _forEachChangedGroupDepthFirst(this.beans.rowModel.rootNode, true, changedPath, callback);
    }

    private treeDataFilter(fm: FilterManager): void {
        const filterCallback = (node: RowNode, includeChildNodes: boolean) => {
            const children = node.childrenAfterGroup;
            if (children && !includeChildNodes) {
                node.childrenAfterFilter = filterDeep(children, node.childrenAfterFilter, fm);
            } else {
                node.childrenAfterFilter = children;
            }
            syncSibling(node);
        };

        const depthFirst = (node: RowNode, alreadyFoundInParent: boolean) => {
            const children = node.childrenAfterGroup;
            if (children) {
                for (let i = 0, len = children.length; i < len; ++i) {
                    const child = children[i];
                    const foundInParent = alreadyFoundInParent || fm.doesRowPassFilter(child);
                    if (child.childrenAfterGroup) {
                        depthFirst(child, foundInParent);
                    } else {
                        filterCallback(child, foundInParent);
                    }
                }
            }
            filterCallback(node, alreadyFoundInParent);
        };

        depthFirst(this.beans.rowModel.rootNode!, false);
    }

    private doingTreeDataFiltering(): boolean {
        return !!this.beans.groupStage?.treeData && !this.gos.get('excludeChildrenWhenTreeDataFiltering');
    }
}
