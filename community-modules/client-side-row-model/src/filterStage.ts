import {
    Autowired,
    Bean,
    GridOptionsWrapper,
    IRowNodeStage,
    SelectableService,
    StageExecuteParams,
    ModuleLogger
} from "ag-grid-community"

import {FilterService} from "./filterService";

ModuleLogger.logModuleClass('CSRM.FilterStage');

@Bean('filterStage')
export class FilterStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectableService') private selectableService: SelectableService;
    @Autowired('filterService') private filterService: FilterService;

    public execute(params: StageExecuteParams): void {
        const {rowNode, changedPath} = params;

        this.filterService.filter(changedPath);

        this.selectableService.updateSelectableAfterFiltering(rowNode);
    }
}
