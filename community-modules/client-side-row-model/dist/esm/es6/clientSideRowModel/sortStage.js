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
        const sortContainsGroupColumns = sortOptions.some(opt => !!this.columnModel.getGroupDisplayColumnForGroup(opt.column.getId()));
        this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
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
