import type {
    BeanCollection,
    IClientSideRowModel,
    IRowModel,
    ISelectionService,
    NamedBean,
    RowNode,
} from '@ag-grid-community/core';
import {
    BeanStub,
    ChangedPath,
    _getGroupSelectsDescendants,
    _getIsRowSelectable,
    _getRowSelectionMode,
    _isClientSideRowModel,
} from '@ag-grid-community/core';

export class SelectableService extends BeanStub implements NamedBean {
    beanName = 'selectableService' as const;

    private rowModel: IRowModel;
    private selectionService: ISelectionService;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.selectionService = beans.selectionService!;
    }

    public postConstruct() {
        this.addManagedPropertyListener('isRowSelectable', () => this.updateSelectable());
    }

    /**
     * Used by CSRM only, to update selectable state after group state changes.
     */
    public updateSelectableAfterGrouping(): void {
        this.updateSelectable(true);
    }

    private updateSelectable(skipLeafNodes = false) {
        const { gos } = this;

        const isRowSelecting = _getRowSelectionMode(gos) !== undefined;
        const isRowSelectable = _getIsRowSelectable(gos);

        if (!isRowSelecting || !isRowSelectable) {
            return;
        }

        const isGroupSelectsChildren = _getGroupSelectsDescendants(gos);
        const isCsrmGroupSelectsChildren = _isClientSideRowModel(gos) && isGroupSelectsChildren;

        const nodesToDeselect: RowNode[] = [];

        const nodeCallback = (node: RowNode) => {
            if (skipLeafNodes && !node.group) {
                return;
            }

            // Only in the CSRM, we allow group node selection if a child has a selectable=true when using groupSelectsChildren
            if (isCsrmGroupSelectsChildren && node.group) {
                const hasSelectableChild = node.childrenAfterGroup!.some((rowNode) => rowNode.selectable === true);
                node.setRowSelectable(hasSelectableChild, true);
                return;
            }

            const rowSelectable = isRowSelectable?.(node) ?? true;
            node.setRowSelectable(rowSelectable, true);

            if (!rowSelectable && node.isSelected()) {
                nodesToDeselect.push(node);
            }
        };

        // Needs to be depth first in this case, so that parents can be updated based on child.
        if (isCsrmGroupSelectsChildren) {
            const csrm = this.rowModel as IClientSideRowModel;
            const changedPath = new ChangedPath(false, csrm.getRootNode());
            changedPath.forEachChangedNodeDepthFirst(nodeCallback, true, true);
        } else {
            // Normal case, update all rows
            this.rowModel.forEachNode(nodeCallback);
        }

        if (nodesToDeselect.length) {
            this.selectionService.setNodesSelected({
                nodes: nodesToDeselect,
                newValue: false,
                source: 'selectableChanged',
            });
        }

        // if csrm and group selects children, update the groups after deselecting leaf nodes.
        if (isCsrmGroupSelectsChildren) {
            this.selectionService.updateGroupsFromChildrenSelections('selectableChanged');
        }
    }
}
