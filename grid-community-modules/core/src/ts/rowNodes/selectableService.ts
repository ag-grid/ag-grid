import { RowNode } from "../entities/rowNode";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { IRowModel } from "../interfaces/iRowModel";
import { ISelectionService } from "../interfaces/iSelectionService";
import { SelectionService } from "../selectionService";
import { ChangedPath } from "../utils/changedPath";
import { IClientSideRowModel } from "../main";
@Bean('selectableService')
export class SelectableService extends BeanStub {
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('selectionService') private selectionService: ISelectionService;
    
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
        const isGroupSelectsChildren = this.gridOptionsService.get('groupSelectsChildren');
        const isRowSelectable = this.gridOptionsService.get('isRowSelectable');

        const isCsrmGroupSelectsChildren = this.rowModel.getType() === 'clientSide' && isGroupSelectsChildren;

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
            const csrm = this.rowModel as IClientSideRowModel;
            const changedPath = new ChangedPath(false, csrm.getRootNode());
            changedPath.forEachChangedNodeDepthFirst(nodeCallback, true, true);
        } else {
            // Normal case, update all rows
            this.rowModel.forEachNode(nodeCallback);
        }

        if (nodesToDeselect.length) {
            this.selectionService.setNodesSelected({ nodes: nodesToDeselect, newValue: false, source: 'selectableChanged' });
        }

        // if csrm and group selects children, update the groups after deselecting leaf nodes.
        if (isCsrmGroupSelectsChildren && this.selectionService instanceof SelectionService) {
            this.selectionService.updateGroupsFromChildrenSelections('selectableChanged');
        }
    }

}
