import type { AgColumn, DragAndDropIcon, FocusableContainer, GridDraggingEvent } from 'ag-grid-community';
import { _addFocusableContainerListener, _createIconNoSpan } from 'ag-grid-community';

import { isDeferredMode, refreshDeferredToolPanelUi } from '../../columnToolPanel/toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from '../../columnToolPanel/updates/columnStateUpdateTypes';
import { BaseDropZonePanel } from './baseDropZonePanel';

export class PivotDropZonePanel extends BaseDropZonePanel implements FocusableContainer {
    constructor(horizontal: boolean, params?: ColumnStateUpdateParams, embedded = false) {
        super(horizontal, 'pivot', params, embedded);
    }

    public postConstruct(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to set column labels');
        const title = localeTextFunc('pivots', 'Column Labels');

        super.init({
            icon: _createIconNoSpan('pivotPanel', this.beans, null)!,
            emptyMessage: emptyMessage,
            title: title,
        });

        // See RowGroupDropZonePanel — embedded drop zones defer tab hand-off to their host.
        if (this.horizontal && !this.embedded) {
            _addFocusableContainerListener(this.beans, this, this.getGui());
        }

        this.addManagedEventListeners({
            newColumnsLoaded: this.refresh.bind(this),
            columnPivotChanged: this.refresh.bind(this),
            columnPivotModeChanged: this.checkVisibility.bind(this),
        });

        this.refresh();
    }

    protected getAriaLabel(): string {
        const translate = this.getLocaleTextFunc();

        return translate('ariaPivotDropZonePanelLabel', 'Column Labels');
    }

    public refresh(): void {
        this.checkVisibility();
        this.refreshGui();
    }

    private checkVisibility(): void {
        const colModel = this.beans.colModel;
        const pivotMode = colModel.pivotMode;

        if (this.horizontal) {
            // what we do for horizontal (ie the pivot panel at the top) depends
            // on the user property as well as pivotMode.
            switch (this.gos.get('pivotPanelShow')) {
                case 'always':
                    this.setDisplayed(pivotMode);
                    break;
                case 'onlyWhenPivoting': {
                    const pivotActive = colModel.isPivotActive();
                    this.setDisplayed(pivotMode && pivotActive);
                    break;
                }
                default:
                    // never show it
                    this.setDisplayed(false);
                    break;
            }
        } else {
            // in toolPanel, the pivot panel is always shown when pivot mode is on
            this.setDisplayed(this.beans.columnStateUpdateStrategy.getPivotMode(isDeferredMode(this.updateParams)));
        }
    }

    protected isItemDroppable(column: AgColumn, draggingEvent: GridDraggingEvent): boolean {
        // we never allow grouping of secondary columns
        if (this.gos.get('functionsReadOnly') || !column.primary) {
            return false;
        }

        const isActive = this.beans.columnStateUpdateStrategy
            .getPivotColumns(isDeferredMode(this.updateParams))
            .includes(column);
        return column.isAllowPivot() && (!isActive || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: AgColumn[]): void {
        this.beans.columnStateUpdateStrategy.setPivotColumns(isDeferredMode(this.updateParams), columns, 'toolPanelUi');
        refreshDeferredToolPanelUi(this.beans, this.updateParams);
    }

    protected getIconName(): DragAndDropIcon {
        return this.isPotentialDndItems() ? 'pivot' : 'notAllowed';
    }

    protected getExistingItems(): AgColumn[] {
        return this.beans.columnStateUpdateStrategy.getPivotColumns(isDeferredMode(this.updateParams));
    }

    public getFocusableContainerName(): 'pivotToolbar' {
        return 'pivotToolbar';
    }
}
