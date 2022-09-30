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
        const sortContainsGroupColumns = sortOptions.some(opt => !!this.columnModel.getGroupDisplayColumnForGroup(opt.column.getId()));
        this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
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
