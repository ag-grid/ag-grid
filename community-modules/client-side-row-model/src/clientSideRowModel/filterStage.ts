import type { BeanCollection, IRowNodeStage, NamedBean, StageExecuteParams } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import type { FilterService } from './filterService';

export class FilterStage extends BeanStub implements IRowNodeStage, NamedBean {
    beanName = 'filterStage' as const;

    private filterService: FilterService;

    public wireBeans(beans: BeanCollection): void {
        this.filterService = beans.filterService;
    }

    public execute(params: StageExecuteParams): void {
        const { changedPath } = params;
        this.filterService.filter(changedPath!);
    }
}
