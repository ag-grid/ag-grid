import {
    Utils,
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

export class PivotColumnsPanel extends AbstractColumnDropPanel {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    constructor(horizontal: boolean) {
        super(horizontal, false, 'pivot');
    }

    @PostConstruct
    private passBeansUp(): void {
        super.setBeans({
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.context,
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to set column labels');
        var title = localeTextFunc('pivots', 'Column Labels');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: Utils.createIconNoSpan('pivotPanel', this.gridOptionsWrapper, null, svgFactory.createPivotIcon),
            emptyMessage: emptyMessage,
            title: title
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.checkVisibility.bind(this));

        this.refresh();
    }

    private refresh(): void {
        this.checkVisibility();
        this.refreshGui();
    }

    private checkVisibility(): void {
        var pivotMode = this.columnController.isPivotMode();

        if (this.isHorizontal()) {
            // what we do for horizontal (ie the pivot panel at the top) depends
            // on the user property as well as pivotMode.
            switch (this.gridOptionsWrapper.getPivotPanelShow()) {
                case 'always':
                    this.setVisible(pivotMode);
                    break;
                case 'onlyWhenPivoting':
                    var pivotActive = this.columnController.isPivotActive();
                    this.setVisible(pivotMode && pivotActive);
                    break;
                default:
                    // never show it
                    this.setVisible(false);
                    break;
            }
        } else {
            // in toolPanel, the pivot panel is always shown when pivot mode is on
            this.setVisible(pivotMode);
        }
    }

    protected isColumnDroppable(column: Column): boolean {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) { return false; }

        // we never allow grouping of secondary columns
        if (!column.isPrimary()) { return false; }

        var allowPivot = column.isAllowPivot();
        var columnNotAlreadyPivoted = !column.isPivotActive();
        return allowPivot && columnNotAlreadyPivoted;
    }

    protected updateColumns(columns: Column[]): void {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST, {columns: columns} );
        } else {
            this.columnController.setPivotColumns(columns);
        }
    }

    protected getIconName(): string {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_PIVOT : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected getExistingColumns(): Column[] {
        return this.columnController.getPivotColumns();
    }

}