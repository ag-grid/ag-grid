import { Bean, Autowired } from "../../context/context";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { StageExecuteParams } from "../../interfaces/iRowNodeStage";
import { SortOption, SortService } from "../../rowNodes/sortService";
import { RowNode } from "../../entities/rowNode";
import { SortController } from "../../sortController";
import { RowNodeTransaction } from "./clientSideRowModel";
import { ColumnController } from "../../columnController/columnController";
import { _ } from "../../utils";

@Bean('sortStage')
export class SortStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('sortService') private sortService: SortService;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('columnController') private columnController: ColumnController;

    public execute(params: StageExecuteParams): void {
        const sortOptions: SortOption[] = this.sortController.getSortForRowController();

        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsWrapper.isDeltaSort();

        // we only need dirty nodes if doing delta sort
        const dirtyLeafNodes = deltaSort ? this.calculateDirtyNodes(params.rowNodeTransactions) : null;

        const valueColumns = this.columnController.getValueColumns();
        const noAggregations = _.missingOrEmpty(valueColumns);

        this.sortService.sort(sortOptions, sortActive, deltaSort, dirtyLeafNodes, params.changedPath, noAggregations);
    }

    private calculateDirtyNodes(rowNodeTransactions: RowNodeTransaction[]): {[nodeId: string]: boolean} {

        const dirtyNodes: {[nodeId: string]: boolean} = {};

        const addNodesFunc = (rowNodes: RowNode[]) => {
            if (rowNodes) {
                rowNodes.forEach(rowNode => dirtyNodes[rowNode.id] = true);
            }
        };

        // all leaf level nodes in the transaction were impacted
        rowNodeTransactions.forEach(tran => {
            addNodesFunc(tran.add);
            addNodesFunc(tran.update);
            addNodesFunc(tran.remove);
        });

        return dirtyNodes;
    }

}
