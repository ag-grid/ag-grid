import { Bean, Autowired } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { IRowNodeStage, StageExecuteParams } from "../../interfaces/iRowNodeStage";
import { FilterService } from "./filterService";
import { SelectableService } from "../../rowNodes/selectableService";
import {ModuleLogger} from "../../utils/moduleLogger";

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
