import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import {
    _getGroupSelectsDescendants,
    _getIsRowSelectable,
    _getRowSelectionMode,
    _isClientSideRowModel,
} from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IRowModel } from '../interfaces/iRowModel';
import type { ISetNodesSelectedParams } from '../interfaces/iSelectionService';
import { ChangedPath } from '../utils/changedPath';
import { CheckboxSelectionComponent } from './checkboxSelectionComponent';
import { SelectAllFeature } from './selectAllFeature';

export abstract class BaseSelectionService extends BeanStub {
    protected rowModel: IRowModel;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
    }

    public postConstruct(): void {
        this.addManagedPropertyListener('isRowSelectable', () => this.updateSelectable(false));
    }

    public createCheckboxSelectionComponent(): CheckboxSelectionComponent {
        return new CheckboxSelectionComponent();
    }

    public createSelectAllFeature(column: AgColumn): SelectAllFeature {
        return new SelectAllFeature(column);
    }

    protected dispatchSelectionChanged(source: SelectionEventSourceType): void {
        this.eventService.dispatchEvent({
            type: 'selectionChanged',
            source,
        });
    }

    // should only be called if groupSelectsChildren=true
    public updateGroupsFromChildrenSelections?(source: SelectionEventSourceType, changedPath?: ChangedPath): boolean;

    public abstract setNodesSelected(params: ISetNodesSelectedParams): number;

    public updateSelectableAfterGrouping(changedPath: ChangedPath | undefined): void {
        this.updateSelectable(true);

        if (_getGroupSelectsDescendants(this.gos)) {
            const selectionChanged = this.updateGroupsFromChildrenSelections?.('rowGroupChanged', changedPath);
            if (selectionChanged) {
                this.eventService.dispatchEvent({
                    type: 'selectionChanged',
                    source: 'rowGroupChanged',
                });
            }
        }
    }

    /**
     * Updates the selectable state for a node by invoking isRowSelectable callback.
     * If the node is not selectable, it will be deselected.
     *
     * Callers:
     *  - property isRowSelectable changed
     *  - after grouping / treeData
     */
    private updateSelectable(skipLeafNodes: boolean) {
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
            this.setNodesSelected({
                nodes: nodesToDeselect,
                newValue: false,
                source: 'selectableChanged',
            });
        }

        // if csrm and group selects children, update the groups after deselecting leaf nodes.
        if (isCsrmGroupSelectsChildren) {
            this.updateGroupsFromChildrenSelections?.('selectableChanged');
        }
    }
}
