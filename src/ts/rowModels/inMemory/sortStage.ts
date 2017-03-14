import {Bean, Autowired} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {StageExecuteParams} from "../../interfaces/iRowNodeStage";
import {SortService} from "../../rowNodes/sortService";

@Bean('sortStage')
export class SortStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('sortService') private sortService: SortService;

    public execute(params: StageExecuteParams): void {
        // if the sorting is already done by the server, then we should not do it here
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            this.sortService.sort(params.rowNode, null);
        }else{
            this.sortService.sortAccordingToColumnsState(params.rowNode);
        }

    }


}