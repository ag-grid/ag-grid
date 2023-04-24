import {
    _,
    Autowired,
    Bean,
    ColumnModel,
    SortController,
    StageExecuteParams,
    BeanStub,
    SortOption
} from "@ag-grid-community/core";

import { SortService } from "./sortService";

@Bean('sortStage')
export class SortStage extends BeanStub {

    @Autowired('sortService') private sortService: SortService;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('columnModel') private columnModel: ColumnModel;

    public execute(params: StageExecuteParams): void {
        const sortOptions: SortOption[] = this.sortController.getSortOptions();

        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsService.is('deltaSort');

        const sortContainsGroupColumns = sortOptions.some(opt => !!this.columnModel.getGroupDisplayColumnForGroup(opt.column.getId()));
        this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
    }
}
