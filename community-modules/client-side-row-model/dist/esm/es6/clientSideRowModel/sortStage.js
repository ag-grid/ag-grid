var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
let SortStage = class SortStage extends BeanStub {
    execute(params) {
        const sortOptions = this.sortController.getSortOptions();
        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsWrapper.isDeltaSort();
        // we only need dirty nodes if doing delta sort
        const dirtyLeafNodes = deltaSort ? this.calculateDirtyNodes(params.rowNodeTransactions) : null;
        const noAggregations = _.missingOrEmpty(this.columnModel.getValueColumns());
        const sortContainsGroupColumns = sortOptions.some(opt => !!opt.column.getColDef().showRowGroup);
        this.sortService.sort(sortOptions, sortActive, deltaSort, dirtyLeafNodes, params.changedPath, noAggregations, sortContainsGroupColumns);
    }
    calculateDirtyNodes(rowNodeTransactions) {
        const dirtyNodes = {};
        const addNodesFunc = (rowNodes) => {
            if (rowNodes) {
                rowNodes.forEach(rowNode => dirtyNodes[rowNode.id] = true);
            }
        };
        // all leaf level nodes in the transaction were impacted
        if (rowNodeTransactions) {
            rowNodeTransactions.forEach(tran => {
                addNodesFunc(tran.add);
                addNodesFunc(tran.update);
                addNodesFunc(tran.remove);
            });
        }
        return dirtyNodes;
    }
};
__decorate([
    Autowired('sortService')
], SortStage.prototype, "sortService", void 0);
__decorate([
    Autowired('sortController')
], SortStage.prototype, "sortController", void 0);
__decorate([
    Autowired('columnModel')
], SortStage.prototype, "columnModel", void 0);
SortStage = __decorate([
    Bean('sortStage')
], SortStage);
export { SortStage };
//# sourceMappingURL=sortStage.js.map