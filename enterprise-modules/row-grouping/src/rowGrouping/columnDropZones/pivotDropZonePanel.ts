import {
    _,
    Autowired,
    Column,
    ColumnModel,
    ColumnPivotChangeRequestEvent,
    DragAndDropService,
    Events,
    ITooltipParams,
    LoggerFactory,
    PostConstruct,
    WithoutGridCommon,
    getLocaleTextFunc
} from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";

export class PivotDropZonePanel extends BaseDropZonePanel {

    @Autowired('columnModel') private columnModel: ColumnModel;

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    constructor(horizontal: boolean) {
        super(horizontal, 'pivot');
    }

    @PostConstruct
    private passBeansUp(): void {
        super.setBeans({
            gridOptionsWrapper: this.gridOptionsWrapper,
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });

        const localeTextFunc = getLocaleTextFunc(this.gridOptionsService);
        const emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to set column labels');
        const title = localeTextFunc('pivots', 'Column Labels');

        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('pivotPanel', this.gridOptionsService, null)!,
            emptyMessage: emptyMessage,
            title: title
        });

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.checkVisibility.bind(this));

        this.refresh();
    }

    protected getAriaLabel(): string {
        const translate = getLocaleTextFunc(this.gridOptionsService);
        const label = translate('ariaPivotDropZonePanelLabel', 'Column Labels');

        return label;
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'pivotColumnsList';
        return res;
    }

    private refresh(): void {
        this.checkVisibility();
        this.refreshGui();
    }

    private checkVisibility(): void {
        const pivotMode = this.columnModel.isPivotMode();

        if (this.isHorizontal()) {
            // what we do for horizontal (ie the pivot panel at the top) depends
            // on the user property as well as pivotMode.
            switch (this.gridOptionsService.get('pivotPanelShow')) {
                case 'always':
                    this.setDisplayed(pivotMode);
                    break;
                case 'onlyWhenPivoting':
                    const pivotActive = this.columnModel.isPivotActive();
                    this.setDisplayed(pivotMode && pivotActive);
                    break;
                default:
                    // never show it
                    this.setDisplayed(false);
                    break;
            }
        } else {
            // in toolPanel, the pivot panel is always shown when pivot mode is on
            this.setDisplayed(pivotMode);
        }
    }

    protected isColumnDroppable(column: Column): boolean {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) { return false; }

        return column.isAllowPivot() && !column.isPivotActive();
    }

    protected updateColumns(columns: Column[]): void {
        if (this.gridOptionsService.is('functionsPassive')) {
            const event: WithoutGridCommon<ColumnPivotChangeRequestEvent> = {
                type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: columns
            };

            this.eventService.dispatchEvent(event);
        } else {
            this.columnModel.setPivotColumns(columns, "toolPanelUi");
        }
    }

    protected getIconName(): string {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_PIVOT : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected getExistingColumns(): Column[] {
        return this.columnModel.getPivotColumns();
    }
}
