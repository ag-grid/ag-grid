import { Autowired, Bean, BeanStub, GridOptions, IRowNodeStage, StageExecuteParams } from '@ag-grid-community/core';

import { FilterService } from './filterService';

@Bean('filterStage')
export class FilterStage extends BeanStub implements IRowNodeStage {
    @Autowired('filterService') private filterService: FilterService;

    public execute(params: StageExecuteParams): void {
        const { changedPath } = params;
        this.filterService.filter(changedPath!);
    }
}
