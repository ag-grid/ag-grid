import {
    _,
    Autowired,
    Bean,
    SortController,
    StageExecuteParams,
    BeanStub,
    SortOption,
    IRowNodeStage,
    GridOptions
} from "@ag-grid-community/core";

import { SortService } from "./sortService";

@Bean('sortStage')
export class SortStage extends BeanStub implements IRowNodeStage {

    @Autowired('sortService') private sortService: SortService;
    @Autowired('sortController') private sortController: SortController;

    public execute(params: StageExecuteParams): void {
        const sortOptions: SortOption[] = this.sortController.getSortOptions();

        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsService.get('deltaSort');


        const sortContainsGroupColumns = sortOptions.some(opt => {
            const isSortingCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
            if (isSortingCoupled) {
                return opt.column.isPrimary() && opt.column.isRowGroupActive();
            }
            return !!opt.column.getColDef().showRowGroup;
        });
        this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
    }
}
