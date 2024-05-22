import {
    Autowired,
    Bean,
    BeanStub,
    IRowNodeStage,
    SortController,
    SortOption,
    StageExecuteParams,
    _exists,
} from '@ag-grid-community/core';

import { SortService } from './sortService';

@Bean('sortStage')
export class SortStage extends BeanStub implements IRowNodeStage {
    @Autowired('sortService') private sortService: SortService;
    @Autowired('sortController') private sortController: SortController;

    public execute(params: StageExecuteParams): void {
        const sortOptions: SortOption[] = this.sortController.getSortOptions();

        const sortActive = _exists(sortOptions) && sortOptions.length > 0;
        const deltaSort =
            sortActive &&
            _exists(params.rowNodeTransactions) &&
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            this.gos.get('deltaSort');

        const sortContainsGroupColumns = sortOptions.some((opt) => {
            const isSortingCoupled = this.gos.isColumnsSortingCoupledToGroup();
            if (isSortingCoupled) {
                return opt.column.isPrimary() && opt.column.isRowGroupActive();
            }
            return !!opt.column.getColDef().showRowGroup;
        });
        this.sortService.sort(
            sortOptions,
            sortActive,
            deltaSort,
            params.rowNodeTransactions,
            params.changedPath,
            sortContainsGroupColumns
        );
    }
}
