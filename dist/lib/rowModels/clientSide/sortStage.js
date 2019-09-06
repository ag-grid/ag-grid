/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var sortService_1 = require("../../rowNodes/sortService");
var sortController_1 = require("../../sortController");
var columnController_1 = require("../../columnController/columnController");
var utils_1 = require("../../utils");
var SortStage = /** @class */ (function () {
    function SortStage() {
    }
    SortStage.prototype.execute = function (params) {
        var sortOptions = this.sortController.getSortForRowController();
        var sortActive = utils_1._.exists(sortOptions) && sortOptions.length > 0;
        var deltaSort = sortActive
            && utils_1._.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsWrapper.isDeltaSort();
        // we only need dirty nodes if doing delta sort
        var dirtyLeafNodes = deltaSort ? this.calculateDirtyNodes(params.rowNodeTransactions) : null;
        var valueColumns = this.columnController.getValueColumns();
        var noAggregations = utils_1._.missingOrEmpty(valueColumns);
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
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], SortStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('sortService'),
        __metadata("design:type", sortService_1.SortService)
    ], SortStage.prototype, "sortService", void 0);
    __decorate([
        context_1.Autowired('sortController'),
        __metadata("design:type", sortController_1.SortController)
    ], SortStage.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], SortStage.prototype, "columnController", void 0);
    SortStage = __decorate([
        context_1.Bean('sortStage')
    ], SortStage);
    return SortStage;
}());
exports.SortStage = SortStage;
