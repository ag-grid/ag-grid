import {
    Column,
    DragAndDropService,
    DraggingEvent,
    Events,
    ITooltipParams,
    WithoutGridCommon,
    _createIconNoSpan,
} from '@ag-grid-community/core';

import { BaseDropZonePanel } from './baseDropZonePanel';

export class PivotDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean) {
        super(horizontal, 'pivot');
    }

    protected override postConstruct(): void {
        super.postConstruct();
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to set column labels');
        const title = localeTextFunc('pivots', 'Column Labels');

        super.init({
            icon: _createIconNoSpan('pivotPanel', this.gos, null)!,
            emptyMessage: emptyMessage,
            title: title,
        });

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refresh.bind(this));
        this.addManagedListener(
            this.eventService,
            Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            this.checkVisibility.bind(this)
        );

        this.refresh();
    }

    protected getAriaLabel(): string {
        const translate = this.localeService.getLocaleTextFunc();
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
            switch (this.gos.get('pivotPanelShow')) {
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

    protected isItemDroppable(column: Column, draggingEvent: DraggingEvent): boolean {
        // we never allow grouping of secondary columns
        if (this.gos.get('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }

        return column.isAllowPivot() && (!column.isPivotActive() || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: Column[]): void {
        this.funcColsService.setPivotColumns(columns, 'toolPanelUi');
    }

    protected getIconName(): string {
        return this.isPotentialDndItems() ? DragAndDropService.ICON_PIVOT : DragAndDropService.ICON_NOT_ALLOWED;
    }

    protected getExistingItems(): Column[] {
        return this.funcColsService.getPivotColumns();
    }
}
