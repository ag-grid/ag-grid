import {
    SvgFactory,
    Autowired,
    ColumnController,
    EventService,
    Context,
    LoggerFactory,
    DragAndDropService,
    GridOptionsWrapper,
    PostConstruct,
    Events,
    Column
} from "ag-grid/main";
import {AbstractColumnDropPanel} from "./abstractColumnDropPanel";

var svgFactory = SvgFactory.getInstance();

export class RowGroupColumnsPanel extends AbstractColumnDropPanel {

    @Autowired('columnController') private columnController:ColumnController;
    @Autowired('eventService') private eventService:EventService;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper:GridOptionsWrapper;
    @Autowired('context') private context:Context;
    @Autowired('loggerFactory') private loggerFactory:LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService:DragAndDropService;

    constructor(horizontal:boolean) {
        super(horizontal, false);
    }

    @PostConstruct
    private passBeansUp():void {
        super.setBeans({
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.context,
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to group');
        var title = localeTextFunc('groups', 'Groups');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            iconFactory: svgFactory.createGroupIcon,
            emptyMessage: emptyMessage,
            title: title
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    }

    protected isColumnDroppable(column:Column):boolean {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) { return false; }

        // we never allow grouping of secondary columns
        if (!column.isPrimary()) { return false; }

        var columnGroupable = column.isAllowRowGroup();
        var columnNotAlreadyGrouped = !column.isRowGroupActive();
        return columnGroupable && columnNotAlreadyGrouped;
    }

    protected removeColumns(columns:Column[]) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_REMOVE_REQUEST, {columns: columns});
        } else {
            // this panel only allows dragging columns (not column groups) so we are guaranteed
            // the dragItem is a column
            var rowGroupColumns = this.columnController.getRowGroupColumns();
            columns.forEach(column => {
                var columnIsGrouped = rowGroupColumns.indexOf(column) >= 0;
                if (columnIsGrouped) {
                    this.columnController.removeRowGroupColumn(column);
                    this.columnController.setColumnVisible(column, true);
                }
            });
        }
    }

    protected getIconName(): string {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_GROUP : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected addColumns(columns: Column[]) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_ADD_REQUEST, {columns: columns} );
        } else {
            this.columnController.addRowGroupColumns(columns);
        }
    }

    protected getExistingColumns(): Column[] {
        return this.columnController.getRowGroupColumns();
    }

}