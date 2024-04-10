import { BeanStub } from "../context/beanStub";
import { Bean, PostConstruct } from "../context/context";
import { RowNode } from "../entities/rowNode";
import { IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { SelectionService } from "../selectionService";
import { ChangedPath } from "../utils/changedPath";
@Bean('selectableService')
export class SelectableService extends BeanStub {
    
    @PostConstruct
    private init() {
        this.addManagedPropertyListener('isRowSelectable', () => this.updateSelectable());
    }

    /**
     * Used by CSRM only, to update selectable state after group state changes.
     */
    public updateSelectableAfterGrouping(): void {
        this.updateSelectable(true);
    }

    private updateSelectable(skipLeafNodes = false) {
        const { selectionService, gos, rowModel } = this.beans;
        const isRowSelecting = !!gos.get('rowSelection');
        const isRowSelectable = gos.get('isRowSelectable');

        if (!isRowSelecting || !isRowSelectable) { return; }

        const isGroupSelectsChildren = gos.get('groupSelectsChildren');

        const isCsrmGroupSelectsChildren = rowModel.getType() === 'clientSide' && isGroupSelectsChildren;

        const nodesToDeselect: RowNode[] = [];

        const nodeCallback = (node: RowNode) => {
            if (skipLeafNodes && !node.group) { return; }

            // Only in the CSRM, we allow group node selection if a child has a selectable=true when using groupSelectsChildren
            if (isCsrmGroupSelectsChildren && node.group) {
                const hasSelectableChild = node.childrenAfterGroup!.some(rowNode => rowNode.selectable === true);
                node.setRowSelectable(hasSelectableChild, true);
                return;
            }

            const rowSelectable = isRowSelectable ? isRowSelectable(node) : true;
            node.setRowSelectable(rowSelectable, true);

            if (!rowSelectable && node.isSelected()) {
                nodesToDeselect.push(node);
            }
        };
        
        // Needs to be depth first in this case, so that parents can be updated based on child.
        if (isCsrmGroupSelectsChildren) {
            const csrm = rowModel as IClientSideRowModel;
            const changedPath = new ChangedPath(false, csrm.getRootNode());
            changedPath.forEachChangedNodeDepthFirst(nodeCallback, true, true);
        } else {
            // Normal case, update all rows
            rowModel.forEachNode(nodeCallback);
        }

        if (nodesToDeselect.length) {
            selectionService.setNodesSelected({ nodes: nodesToDeselect, newValue: false, source: 'selectableChanged' });
        }

        // if csrm and group selects children, update the groups after deselecting leaf nodes.
        if (isCsrmGroupSelectsChildren && selectionService instanceof SelectionService) {
            selectionService.updateGroupsFromChildrenSelections('selectableChanged');
        }
    }

}
