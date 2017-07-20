import {Bean, Autowired} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {IRowNodeStage, StageExecuteParams} from "../../interfaces/iRowNodeStage";
import {FilterService} from "../../rowNodes/filterService";

@Bean('filterStage')
export class FilterStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('filterService') private filterService: FilterService;

    public execute(params: StageExecuteParams): void {
        let rowNode = params.rowNode;


        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            this.filterService.filter(rowNode, false);
        } else {
            this.filterService.filterAccordingToColumnState(rowNode);
        }
    }
}
