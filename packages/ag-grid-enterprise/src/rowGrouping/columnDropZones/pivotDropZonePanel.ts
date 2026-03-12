import type { AgColumn, DragAndDropIcon, FocusableContainer, GridDraggingEvent } from 'ag-grid-community';
import { _addFocusableContainerListener, _createIconNoSpan } from 'ag-grid-community';

import { getColumnToolPanelUpdates } from '../../columnToolPanel/updates/columnToolPanelUpdateUtils';
import type { ColumnToolPanelUpdateParams } from '../../columnToolPanel/updates/columnToolPanelUpdatesTypes';
import { BaseDropZonePanel } from './baseDropZonePanel';

export class PivotDropZonePanel extends BaseDropZonePanel implements FocusableContainer {
    constructor(horizontal: boolean, params?: ColumnToolPanelUpdateParams) {
        super(horizontal, 'pivot', params);
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

        // only the top (horizontal) drop zone participates in core grid container tabbing.
        if (this.horizontal) {
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
        const pivotMode = colModel.isPivotMode();

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
            this.setDisplayed(getColumnToolPanelUpdates(this.beans).getPivotMode(!!this.updateParams?.deferApply));
        }
    }

    protected isItemDroppable(column: AgColumn, draggingEvent: GridDraggingEvent): boolean {
        // we never allow grouping of secondary columns
        if (this.gos.get('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }

        const isActive = getColumnToolPanelUpdates(this.beans)
            .getPivotColumns(!!this.updateParams?.deferApply)
            .includes(column);
        return column.isAllowPivot() && (!isActive || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: AgColumn[]): void {
        getColumnToolPanelUpdates(this.beans).setPivotColumns(!!this.updateParams?.deferApply, columns, 'toolPanelUi');
    }

    protected getIconName(): DragAndDropIcon {
        return this.isPotentialDndItems() ? 'pivot' : 'notAllowed';
    }

    protected getExistingItems(): AgColumn[] {
        return getColumnToolPanelUpdates(this.beans).getPivotColumns(!!this.updateParams?.deferApply);
    }

    public getFocusableContainerName(): 'pivotToolbar' {
        return 'pivotToolbar';
    }
}
