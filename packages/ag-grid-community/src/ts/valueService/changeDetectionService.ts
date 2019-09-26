import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import {Autowired, Bean, Optional, PostConstruct} from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ChangedPath } from "../rowModels/clientSide/changedPath";
import { IRowModel } from "../interfaces/iRowModel";
import { ClientSideRowModel } from "../rowModels/clientSide/clientSideRowModel";
import { RowRenderer } from "../rendering/rowRenderer";
import { EventService } from "../eventService";
import { Constants } from "../constants";
import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
import {IClipboardService} from "../interfaces/iClipboardService";

@Bean('changeDetectionService')
export class ChangeDetectionService extends BeanStub {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('eventService') private eventService: EventService;
    @Optional('clipboardService') private clipboardService: IClipboardService;

    private clientSideRowModel: ClientSideRowModel;

    @PostConstruct
    private init(): void {
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel as ClientSideRowModel;
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.onCellValueChanged.bind(this));
    }

    private onCellValueChanged(event: any): void {
        this.doChangeDetection(event.node, event.column);
    }

    private doChangeDetection(rowNode: RowNode, column: Column): void {
        if (this.gridOptionsWrapper.isSuppressChangeDetection()) { return; }

        // clipboard service manages it's own change detection, so no need to do it here.
        // the clipboard manages it own, as otherwise this would happen once for every cell
        // that got updated as part of a paste operation. so eg if 100 cells in a paste operation,
        // this doChangeDetection would get called 100 times (once for each cell), instead clipboard
        // service executes the logic we have here once (in essence batching up all cell changes
        // into one change detection).
        if (this.clipboardService && this.clipboardService.isPasteOperationActive()) { return; }

        // step 1 of change detection is to update the aggregated values
        if (this.clientSideRowModel && !rowNode.isRowPinned()) {
            const onlyChangedColumns = this.gridOptionsWrapper.isAggregateOnlyChangedColumns();
            const changedPath = new ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
            changedPath.addParentNode(rowNode.parent, [column]);
            this.clientSideRowModel.doAggregate(changedPath);
        }

        // step 2 of change detection is to refresh the cells
        this.rowRenderer.refreshCells();
    }

}