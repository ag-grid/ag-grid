import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { FilterManager } from '../filter/filterManager';
import type { ClientSideRowModelStage } from '../interfaces/iClientSideRowModel';
import type { IRowNodeFilterStage } from '../interfaces/iRowNodeStage';
import type { ChangedPath } from '../utils/changedPath';
import { _forEachChangedGroupDepthFirst } from '../utils/changedPath';

export function updateRowNodeAfterFilter(rowNode: RowNode): void {
    const sibling = rowNode.sibling;
    if (sibling) {
        sibling.childrenAfterFilter = rowNode.childrenAfterFilter;
    }
}

export class FilterStage extends BeanStub implements IRowNodeFilterStage, NamedBean {
    beanName = 'filterStage' as const;

    public readonly step: ClientSideRowModelStage = 'filter';
    public readonly refreshProps: (keyof GridOptions<any>)[] = ['excludeChildrenWhenTreeDataFiltering'];

    private filterManager?: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        this.filterManager = beans.filterManager;
    }

    public execute(changedPath: ChangedPath | undefined): void {
        const filterActive = !!this.filterManager?.isChildFilterPresent();
        if (this.beans.formula?.active) {
            this.softFilter(filterActive, changedPath);
        } else {
            this.filterNodes(filterActive, changedPath);
        }
    }

    private filterNodes(filterActive: boolean, changedPath: ChangedPath | undefined): void {
        if (this.doingTreeDataFiltering()) {
            this.filterNodesTreeData(filterActive);
            return;
        }

        const rowModel = this.beans.rowModel;
        const rootNode = rowModel.rootNode;
        if (!rootNode) {
            return;
        }

        if (!rowModel.hierarchical) {
            // Fast path: flat grid — root's children are all leaves, no group hierarchy to check
            this.filterRootFlat(rootNode, filterActive);
            return;
        }

        const filterManager = this.filterManager!;
        const filterCallback = (rowNode: RowNode) => {
            if (rowNode.hasChildren()) {
                if (filterActive) {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup!.filter((childNode) => {
                        // a group is included in the result if it has any children of it's own.
                        // by this stage, the child groups are already filtered
                        const passBecauseChildren =
                            childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;

                        // both leaf level nodes and tree data nodes have data. these get added if
                        // the data passes the filter
                        const passBecauseDataPasses =
                            childNode.data && filterManager.doesRowPassFilter({ rowNode: childNode });

                        return passBecauseChildren || passBecauseDataPasses;
                    });
                } else {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                }
            } else {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            }

            updateRowNodeAfterFilter(rowNode);
        };

        _forEachChangedGroupDepthFirst(rootNode, true, changedPath, filterCallback);
    }

    /** Fast path for flat grids: all root children are leaves, no group checks needed. */
    private filterRootFlat(rootNode: RowNode, filterActive: boolean): void {
        if (filterActive) {
            const filterManager = this.filterManager!;
            rootNode.childrenAfterFilter = rootNode.childrenAfterGroup!.filter(
                (childNode) => childNode.data && filterManager.doesRowPassFilter({ rowNode: childNode })
            );
        } else {
            rootNode.childrenAfterFilter = rootNode.childrenAfterGroup;
        }
        updateRowNodeAfterFilter(rootNode);
    }

    private filterNodesTreeData(filterActive: boolean): void {
        const filterCallback = (rowNode: RowNode, includeChildNodes: boolean) => {
            if (rowNode.hasChildren()) {
                if (filterActive && !includeChildNodes) {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup!.filter((childNode) => {
                        const passBecauseChildren =
                            childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
                        const passBecauseDataPasses =
                            childNode.data && this.filterManager!.doesRowPassFilter({ rowNode: childNode });
                        return passBecauseChildren || passBecauseDataPasses;
                    });
                } else {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                }
            } else {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            }
            updateRowNodeAfterFilter(rowNode);
        };

        const treeDataDepthFirstFilter = (rowNode: RowNode, alreadyFoundInParent: boolean) => {
            // tree data filter traverses the hierarchy depth first and includes child nodes if parent passes
            // filter, and parent nodes will be include if any children exist.

            if (rowNode.childrenAfterGroup) {
                for (let i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                    const childNode = rowNode.childrenAfterGroup[i];

                    // first check if current node passes filter before invoking child nodes
                    const foundInParent =
                        alreadyFoundInParent || this.filterManager!.doesRowPassFilter({ rowNode: childNode });
                    if (childNode.childrenAfterGroup) {
                        treeDataDepthFirstFilter(rowNode.childrenAfterGroup[i], foundInParent);
                    } else {
                        filterCallback(childNode, foundInParent);
                    }
                }
            }
            filterCallback(rowNode, alreadyFoundInParent);
        };

        treeDataDepthFirstFilter(this.beans.rowModel.rootNode!, false);
    }

    private softFilter(filterActive: boolean, changedPath: ChangedPath | undefined): void {
        const filterCallback = (rowNode: RowNode) => {
            rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            if (rowNode.hasChildren()) {
                for (const childNode of rowNode.childrenAfterGroup!) {
                    childNode.softFiltered =
                        filterActive &&
                        !(childNode.data && this.filterManager!.doesRowPassFilter({ rowNode: childNode }));
                }
            }

            updateRowNodeAfterFilter(rowNode);
        };

        const rowModel = this.beans.rowModel;
        _forEachChangedGroupDepthFirst(rowModel.rootNode, rowModel.hierarchical, changedPath, filterCallback);
    }

    private doingTreeDataFiltering() {
        const { gos } = this;
        return !!this.beans.groupStage?.treeData && !gos.get('excludeChildrenWhenTreeDataFiltering');
    }
}
