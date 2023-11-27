var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct } from "../context/context.mjs";
import { BeanStub } from "../context/beanStub.mjs";
import { SelectionService } from "../selectionService.mjs";
import { ChangedPath } from "../utils/changedPath.mjs";
let SelectableService = class SelectableService extends BeanStub {
    init() {
        this.addManagedPropertyListener('isRowSelectable', () => this.updateSelectable());
    }
    /**
     * Used by CSRM only, to update selectable state after group state changes.
     */
    updateSelectableAfterGrouping() {
        this.updateSelectable(true);
    }
    updateSelectable(skipLeafNodes = false) {
        const isGroupSelectsChildren = this.gridOptionsService.get('groupSelectsChildren');
        const isRowSelectable = this.gridOptionsService.get('isRowSelectable');
        const isCsrmGroupSelectsChildren = this.rowModel.getType() === 'clientSide' && isGroupSelectsChildren;
        const nodesToDeselect = [];
        const nodeCallback = (node) => {
            if (skipLeafNodes && !node.group) {
                return;
            }
            // Only in the CSRM, we allow group node selection if a child has a selectable=true when using groupSelectsChildren
            if (isCsrmGroupSelectsChildren && node.group) {
                const hasSelectableChild = node.childrenAfterGroup.some(rowNode => rowNode.selectable === true);
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
            const csrm = this.rowModel;
            const changedPath = new ChangedPath(false, csrm.getRootNode());
            changedPath.forEachChangedNodeDepthFirst(nodeCallback, true, true);
        }
        else {
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
};
__decorate([
    Autowired('rowModel')
], SelectableService.prototype, "rowModel", void 0);
__decorate([
    Autowired('selectionService')
], SelectableService.prototype, "selectionService", void 0);
__decorate([
    PostConstruct
], SelectableService.prototype, "init", null);
SelectableService = __decorate([
    Bean('selectableService')
], SelectableService);
export { SelectableService };
