"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
let SortStage = class SortStage extends core_1.BeanStub {
    execute(params) {
        const sortOptions = this.sortController.getSortOptions();
        const sortActive = core_1._.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && core_1._.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsWrapper.isDeltaSort();
        // we only need dirty nodes if doing delta sort
        const dirtyLeafNodes = deltaSort ? this.calculateDirtyNodes(params.rowNodeTransactions) : null;
        const noAggregations = core_1._.missingOrEmpty(this.columnModel.getValueColumns());
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
    core_1.Autowired('sortService')
], SortStage.prototype, "sortService", void 0);
__decorate([
    core_1.Autowired('sortController')
], SortStage.prototype, "sortController", void 0);
__decorate([
    core_1.Autowired('columnModel')
], SortStage.prototype, "columnModel", void 0);
SortStage = __decorate([
    core_1.Bean('sortStage')
], SortStage);
exports.SortStage = SortStage;
//# sourceMappingURL=sortStage.js.map