import type { ChangedPath, NamedBean, RowNode, _ITreeDataFilterStage } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class TreeDataFilterStage extends BeanStub implements NamedBean, _ITreeDataFilterStage {
    beanName = 'treeDataFilterSvc' as const;

    /** Called only when filter is active. Passthrough is handled by FilterStage. */
    public execute(rootNode: RowNode, changedPath: ChangedPath | undefined): void {
        const filterManager = this.beans.filterManager!;

        /** Depth-first pass-through: visits ALL nodes including leaves. */
        const passThroughAll = (rowNode: RowNode): void => {
            const children = rowNode.childrenAfterGroup;
            if (children) {
                for (let i = 0, len = children.length; i < len; ++i) {
                    passThroughAll(children[i]);
                }
            }
            rowNode.childrenAfterFilter = children;
            const sibling = rowNode.sibling;
            if (sibling) {
                sibling.childrenAfterFilter = children;
            }
        };

        /**
         * Tree data depth-first filter: if a parent matches, all descendants are included.
         * Otherwise, children are individually filtered. Each child is tested exactly once.
         * Skips recursion into unchanged subtrees when changedPath is provided.
         */
        const filterNode = (rowNode: RowNode, alreadyFoundInParent: boolean): void => {
            const children = rowNode.childrenAfterGroup;
            if (!children) {
                rowNode.childrenAfterFilter = null;
                return;
            }

            // Parent already matched — include all descendants unconditionally.
            if (alreadyFoundInParent) {
                passThroughAll(rowNode);
                return;
            }

            // Parent did not match — filter children, calling doesRowPassFilter exactly once per child.
            const len = children.length;
            const prev = rowNode.childrenAfterFilter;
            let result: RowNode[] | null = null;
            let writeIdx = 0;
            let diffFromPrev = !prev;

            for (let i = 0; i < len; ++i) {
                const childNode = children[i];
                const foundInParent = filterManager.doesRowPassFilter(childNode);

                if (childNode.childrenAfterGroup) {
                    // Skip recursion into unchanged subtrees: if the child and all its descendants
                    // are unchanged (not in changedPath), doesRowPassFilter returns the same result
                    // as the previous run, so the child's childrenAfterFilter is still correct.
                    if (!changedPath || changedPath.hasRow(childNode)) {
                        filterNode(childNode, foundInParent);
                    }
                } else {
                    childNode.childrenAfterFilter = null;
                }

                // A child passes if it matched the filter itself OR has visible descendants.
                const childFiltered = childNode.childrenAfterFilter;
                const passes = foundInParent || (childFiltered != null && childFiltered.length > 0);

                if (passes) {
                    if (!diffFromPrev && prev![writeIdx] !== childNode) {
                        diffFromPrev = true;
                    }
                    if (result !== null) {
                        result[writeIdx] = childNode;
                    }
                    writeIdx++;
                } else if (result === null) {
                    result = new Array<RowNode>(len);
                    for (let j = 0; j < writeIdx; ++j) {
                        result[j] = children[j];
                    }
                }
            }

            let filtered: RowNode[] | null;
            if (result === null) {
                filtered = children;
            } else if (!diffFromPrev && prev!.length === writeIdx) {
                filtered = prev!;
            } else {
                result.length = writeIdx;
                filtered = result;
            }
            rowNode.childrenAfterFilter = filtered;
            const sibling = rowNode.sibling;
            if (sibling) {
                sibling.childrenAfterFilter = filtered;
            }
        };

        filterNode(rootNode, false);
    }
}
