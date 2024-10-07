import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import {
    _getGroupSelectsDescendants,
    _getIsRowSelectable,
    _isClientSideRowModel,
    _isRowSelection,
} from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IRowModel } from '../interfaces/iRowModel';
import type { ISelectionService } from '../interfaces/iSelectionService';
import { SelectionService } from '../selection/selectionService';
import { ChangedPath } from '../utils/changedPath';

export class SelectableService extends BeanStub implements NamedBean {
    beanName = 'selectableService' as const;

    private rowModel: IRowModel;
    private selectionService: ISelectionService;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.selectionService = beans.selectionService;
    }

    public postConstruct() {
        this.addManagedPropertyListeners(['isRowSelectable', 'rowSelection'], () => this.updateSelectable());
    }

    /**
     * Used by CSRM only, to update selectable state after group state changes.
     */
    public updateSelectableAfterGrouping(): void {
        this.updateSelectable(true);
    }

    private updateSelectable(skipLeafNodes = false) {
        const { gos } = this;

        const isRowSelecting = _isRowSelection(gos);
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
        if (isCsrmGroupSelectsChildren && this.selectionService instanceof SelectionService) {
            this.selectionService.updateGroupsFromChildrenSelections('selectableChanged');
        }
    }
}
