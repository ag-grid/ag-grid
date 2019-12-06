"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var SortStage = /** @class */ (function () {
    function SortStage() {
    }
    SortStage.prototype.execute = function (params) {
        var sortOptions = this.sortController.getSortForRowController();
        var sortActive = core_1._.exists(sortOptions) && sortOptions.length > 0;
        var deltaSort = sortActive
            && core_1._.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsWrapper.isDeltaSort();
        // we only need dirty nodes if doing delta sort
        var dirtyLeafNodes = deltaSort ? this.calculateDirtyNodes(params.rowNodeTransactions) : null;
        var valueColumns = this.columnController.getValueColumns();
        var noAggregations = core_1._.missingOrEmpty(valueColumns);
        this.sortService.sort(sortOptions, sortActive, deltaSort, dirtyLeafNodes, params.changedPath, noAggregations);
    };
    SortStage.prototype.calculateDirtyNodes = function (rowNodeTransactions) {
        var dirtyNodes = {};
        var addNodesFunc = function (rowNodes) {
            if (rowNodes) {
                rowNodes.forEach(function (rowNode) { return dirtyNodes[rowNode.id] = true; });
            }
        };
        // all leaf level nodes in the transaction were impacted
        rowNodeTransactions.forEach(function (tran) {
            addNodesFunc(tran.add);
            addNodesFunc(tran.update);
            addNodesFunc(tran.remove);
        });
        return dirtyNodes;
    };
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], SortStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('sortService')
    ], SortStage.prototype, "sortService", void 0);
    __decorate([
        core_1.Autowired('sortController')
    ], SortStage.prototype, "sortController", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], SortStage.prototype, "columnController", void 0);
    SortStage = __decorate([
        core_1.Bean('sortStage')
    ], SortStage);
    return SortStage;
}());
exports.SortStage = SortStage;
//# sourceMappingURL=sortStage.js.map