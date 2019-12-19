import {
    Autowired,
    ColumnController,
    EventService,
    LoggerFactory,
    DragAndDropService,
    GridOptionsWrapper,
    PostConstruct,
    Events,
    Column,
    ColumnValueChangeRequestEvent,
    ColumnApi,
    GridApi,
    _
} from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";

export class ValuesDropZonePanel extends BaseDropZonePanel {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    constructor(horizontal: boolean) {
        super(horizontal, true);
    }

    @PostConstruct
    private passBeansUp(): void {
        super.setBeans({
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag here to aggregate');
        const title = localeTextFunc('values', 'Values');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_AGGREGATE,
            icon: _.createIconNoSpan('valuePanel', this.gridOptionsWrapper, null),
            emptyMessage: emptyMessage,
            title: title
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    }

    protected getIconName(): string {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_AGGREGATE : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected isColumnDroppable(column: Column): boolean {
        // we never allow grouping of secondary columns
        if (this.gridOptionsWrapper.isFunctionsReadOnly() || !column.isPrimary()) { return false; }

        return column.isAllowValue() && !column.isValueActive();
    }

    protected updateColumns(columns: Column[]): void {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            const event: ColumnValueChangeRequestEvent = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: columns,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        } else {
            this.columnController.setValueColumns(columns, "toolPanelUi");
        }
    }

    protected getExistingColumns(): Column[] {
        return this.columnController.getValueColumns();
    }
}
