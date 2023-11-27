var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct } from "../context/context.mjs";
import { BeanStub } from "../context/beanStub.mjs";
import { ClientSideRowModelSteps } from "../interfaces/iClientSideRowModel.mjs";
let ExpansionService = class ExpansionService extends BeanStub {
    postConstruct() {
        this.isClientSideRowModel = this.rowModel.getType() === 'clientSide';
    }
    expandRows(rowIds) {
        if (!this.isClientSideRowModel) {
            return;
        }
        rowIds.forEach(rowId => {
            const rowNode = this.rowModel.getRowNode(rowId);
            if (rowNode) {
                rowNode.expanded = true;
            }
        });
        this.onGroupExpandedOrCollapsed();
    }
    getExpandedRows() {
        const expandedRows = [];
        this.rowModel.forEachNode(({ expanded, id }) => {
            if (expanded && id) {
                expandedRows.push(id);
            }
        });
        return expandedRows;
    }
    expandAll(value) {
        if (!this.isClientSideRowModel) {
            return;
        }
        this.rowModel.expandOrCollapseAll(value);
    }
    setRowNodeExpanded(rowNode, expanded, expandParents) {
        if (rowNode) {
            // expand all parents recursively, except root node.
            if (expandParents && rowNode.parent && rowNode.parent.level !== -1) {
                this.setRowNodeExpanded(rowNode.parent, expanded, expandParents);
            }
            rowNode.setExpanded(expanded);
        }
    }
    onGroupExpandedOrCollapsed() {
        if (!this.isClientSideRowModel) {
            return;
        }
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.rowModel.refreshModel({ step: ClientSideRowModelSteps.MAP });
    }
};
__decorate([
    Autowired('rowModel')
], ExpansionService.prototype, "rowModel", void 0);
__decorate([
    PostConstruct
], ExpansionService.prototype, "postConstruct", null);
ExpansionService = __decorate([
    Bean('expansionService')
], ExpansionService);
export { ExpansionService };
