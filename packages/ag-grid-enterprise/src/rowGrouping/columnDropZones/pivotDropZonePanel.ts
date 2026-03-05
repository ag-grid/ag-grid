import type { AgColumn, DragAndDropIcon, FocusableContainer, GridDraggingEvent } from 'ag-grid-community';
import { _addFocusableContainerListener, _createIconNoSpan } from 'ag-grid-community';

import { addDeferredDraftChangedListener } from '../../columnToolPanel/columnToolPanelEdits';
import type {
    ColumnToolPanelDeferredEdit,
    ColumnToolPanelEditParams,
} from '../../columnToolPanel/columnToolPanelEdits';
import { BaseDropZonePanel } from './baseDropZonePanel';

export class PivotDropZonePanel extends BaseDropZonePanel implements FocusableContainer {
    constructor(horizontal: boolean, params?: ColumnToolPanelEditParams) {
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
        if (this.deferApply) {
            addDeferredDraftChangedListener(this, this.refresh.bind(this));
        }

        this.refresh();
    }

    protected getAriaLabel(): string {
        const translate = this.getLocaleTextFunc();
        const label = translate('ariaPivotDropZonePanelLabel', 'Column Labels');

        return label;
    }

    private refresh(): void {
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
            this.setDisplayed(pivotMode);
        }
    }

    protected isItemDroppable(column: AgColumn, draggingEvent: GridDraggingEvent): boolean {
        // we never allow grouping of secondary columns
        if (this.gos.get('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }

        return column.isAllowPivot() && (!column.isPivotActive() || this.isSourceEventFromTarget(draggingEvent));
    }

    protected updateItems(columns: AgColumn[]): void {
        const edits = this.getEdits();
        if (edits) {
            edits.setPivotColumns(columns, 'toolPanelUi');
            return;
        }
        this.beans.pivotColsSvc?.setColumns(columns, 'toolPanelUi');
    }

    protected getIconName(): DragAndDropIcon {
        return this.isPotentialDndItems() ? 'pivot' : 'notAllowed';
    }

    protected getExistingItems(): AgColumn[] {
        if (this.deferApply) {
            return (this.getEdits() as ColumnToolPanelDeferredEdit).getDraftPivotColumns();
        }

        return this.beans.pivotColsSvc?.columns ?? [];
    }

    public getFocusableContainerName(): 'pivotToolbar' {
        return 'pivotToolbar';
    }
}
