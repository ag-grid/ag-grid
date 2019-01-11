import { Bean, Autowired } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { IRowNodeStage, StageExecuteParams } from "../../interfaces/iRowNodeStage";
import { FilterService } from "../../rowNodes/filterService";
import { SelectableService } from "../../rowNodes/selectableService";

@Bean('filterStage')
export class FilterStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectableService') private selectableService: SelectableService;
    @Autowired('filterService') private filterService: FilterService;

    public execute(params: StageExecuteParams): void {
        const rowNode = params.rowNode;

        this.filterService.filter(rowNode);

        this.selectableService.updateSelectableAfterFiltering(rowNode);
    }
}
