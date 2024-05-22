import type { IRowNodeStage, StageExecuteParams } from '@ag-grid-community/core';
import { Autowired, Bean, BeanStub, GridOptions } from '@ag-grid-community/core';

import type { FilterService } from './filterService';

@Bean('filterStage')
export class FilterStage extends BeanStub implements IRowNodeStage {
    @Autowired('filterService') private filterService: FilterService;

    public execute(params: StageExecuteParams): void {
        const { changedPath } = params;
        this.filterService.filter(changedPath!);
    }
}
