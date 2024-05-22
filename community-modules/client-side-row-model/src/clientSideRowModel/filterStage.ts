import type { BeanCollection, BeanName, IRowNodeStage, StageExecuteParams } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import type { FilterService } from './filterService';

export class FilterStage extends BeanStub implements IRowNodeStage {
    static BeanName: BeanName = 'filterStage';

    private filterService: FilterService;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.filterService = beans.filterService;
    }

    public execute(params: StageExecuteParams): void {
        const { changedPath } = params;
        this.filterService.filter(changedPath!);
    }
}
