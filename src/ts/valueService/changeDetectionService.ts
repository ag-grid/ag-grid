
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {Autowired, Bean, PostConstruct} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ChangedPath} from "../rowModels/inMemory/changedPath";
import {IRowModel} from "../interfaces/iRowModel";
import {InMemoryRowModel} from "../rowModels/inMemory/inMemoryRowModel";
import {RowRenderer} from "../rendering/rowRenderer";
import {EventService} from "../eventService";
import {Constants} from "../constants";
import {BeanStub} from "../context/beanStub";
import {Events} from "../events";

@Bean('changeDetectionService')
export class ChangeDetectionService extends BeanStub {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('eventService') private eventService: EventService;

    private inMemoryRowModel: InMemoryRowModel;

    @PostConstruct
    private init(): void {
        if (this.rowModel.getType()===Constants.ROW_MODEL_TYPE_IN_MEMORY) {
            this.inMemoryRowModel = <InMemoryRowModel> this.rowModel;
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged.bind(this));
    }

    private onCellValueChanged(event: any): void {
        this.doChangeDetection(event.node, event.column);
    }

    private doChangeDetection(rowNode: RowNode, column: Column): void {
        if (this.gridOptionsWrapper.isSuppressChangeDetection()) { return; }

        // step 1 of change detection is to update the aggregated values
        if (this.inMemoryRowModel) {

            let changedPath: ChangedPath;
            if (rowNode.parent) {
                let onlyChangedColumns = this.gridOptionsWrapper.isAggregateOnlyChangedColumns();
                changedPath = new ChangedPath(onlyChangedColumns);
                changedPath.addParentNode(rowNode.parent, [column]);
            }

            this.inMemoryRowModel.doAggregate(changedPath);
        }

        // step 2 of change detection is to refresh the cells
        this.rowRenderer.refreshCells();
    }

}