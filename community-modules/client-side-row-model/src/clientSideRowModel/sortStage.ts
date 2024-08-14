import type {
    BeanCollection,
    IRowNodeStage,
    NamedBean,
    SortController,
    SortOption,
    StageExecuteParams,
} from '@ag-grid-community/core';
import { BeanStub, _exists, _isColumnsSortingCoupledToGroup } from '@ag-grid-community/core';

import type { SortService } from './sortService';

export class SortStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName = 'sortStage' as const;

    private sortService: SortService;
    private sortController: SortController;

    public wireBeans(beans: BeanCollection): void {
        this.sortService = beans.sortService as SortService;
        this.sortController = beans.sortController;
    }

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
            const isSortingCoupled = _isColumnsSortingCoupledToGroup(this.gos);
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
