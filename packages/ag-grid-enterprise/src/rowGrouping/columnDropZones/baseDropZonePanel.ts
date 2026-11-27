import type {
    AgColumn,
    ColumnEventType,
    DragItem,
    DropTarget,
    GridDraggingEvent,
    SortDirection,
} from 'ag-grid-community';
import { DragSourceType, _resolvePivotSort, _shouldUpdateColVisibilityAfterGroup } from 'ag-grid-community';

import type { ColumnToolPanelChildParams } from '../../columnToolPanel/columnToolPanel';
import { isDeferredMode, refreshDeferredToolPanelUi } from '../../columnToolPanel/toolPanelDeferredUiUtils';
import { _isContextMenuKey, _showMenuListPopup } from '../../widgets/menuPopupUtils';
import type { PillDropZonePanelParams } from '../../widgets/pillDropZonePanel';
import { PillDropZonePanel } from '../../widgets/pillDropZonePanel';
import type { ChipMenuActions, ChipMenuParams } from './dropZoneChipMenu';
import { createChipMenuItemDefs, resolveChipMenuItems } from './dropZoneChipMenu';
import { DropZoneColumnComp } from './dropZoneColumnComp';

export type TDropZone = 'rowGroup' | 'pivot' | 'aggregation';

export abstract class BaseDropZonePanel extends PillDropZonePanel<DropZoneColumnComp, AgColumn> {
    protected readonly embedded: boolean;
    private hideMoveMenu?: () => void;
    private readonly chipComps = new Map<AgColumn, DropZoneColumnComp>();

    constructor(
        horizontal: boolean,
        private readonly dropZonePurpose: TDropZone,
        protected readonly updateParams?: ColumnToolPanelChildParams,
        embedded = false
    ) {
        super(horizontal, updateParams?.eWrapperPanel);
        this.embedded = embedded;
        this.addElementClasses(this.getGui(), this.dropZonePurpose.toLowerCase());
    }

    public override init(params: PillDropZonePanelParams): void {
        super.init(params);
        this.addDestroyFunc(() => this.hideMoveMenu?.());

        const refreshGui = this.refreshGui.bind(this);
        this.addManagedEventListeners({ newColumnsLoaded: refreshGui, columnPivotModeChanged: refreshGui });

        this.addManagedPropertyListeners(
            [
                'functionsReadOnly',
                'rowGroupPanelSuppressSort',
                'pivotPanelSuppressSort',
                'groupLockGroupColumns',
                'getColumnDropZoneMenuItems',
            ],
            refreshGui
        );
    }

    protected getItems(dragItem: DragItem): AgColumn[] {
        return (dragItem.columns as AgColumn[]) ?? [];
    }

    protected isInterestedIn(type: DragSourceType, sourceElement: Element): boolean {
        if (type === DragSourceType.HeaderCell) {
            return true;
        }

        if (type !== DragSourceType.ToolPanel) {
            return false;
        }

        if (!this.horizontal) {
            return true;
        }

        // Tool panel drag sources are HTML or SVG elements, both of which have `dataset`.
        return (sourceElement as HTMLElement | SVGElement).dataset.columnToolPanelDeferred === undefined;
    }

    protected override minimumAllowedNewInsertIndex(): number {
        if (!this.isRowGroupPanel()) {
            return 0;
        }
        const numberOfLockedCols = this.gos.get('groupLockGroupColumns');
        const numberOfGroupCols = this.getExistingItems().length;
        if (numberOfLockedCols === -1) {
            return numberOfGroupCols;
        }
        return Math.min(numberOfLockedCols, numberOfGroupCols);
    }

    public override refreshGui(): void {
        this.hideMoveMenu?.();
        this.chipComps.clear();
        super.refreshGui();
    }

    protected override createItemComponent(column: AgColumn, ghost: boolean): DropZoneColumnComp {
        const comp = super.createItemComponent(column, ghost);
        if (!ghost) {
            this.chipComps.set(column, comp);
            if (resolveChipMenuItems(this.getChipMenuParams(comp)).length) {
                comp.getGui().setAttribute('aria-haspopup', 'menu');
            }
            comp.addGuiEventListener('contextmenu', (event: MouseEvent) => this.openChipMenu(column, event));
            comp.addGuiEventListener('keydown', (event: KeyboardEvent) => {
                if (_isContextMenuKey(event)) {
                    this.openChipMenu(column, event);
                }
            });
        }
        return comp;
    }

    /**
     * Opens the menu of `column`'s chip, positioned by the mouse event or else under `anchor` or the chip.
     * Returns whether a menu opened.
     */
    public openChipMenu(column: AgColumn, anchor?: MouseEvent | KeyboardEvent | HTMLElement): boolean {
        this.hideMoveMenu?.();
        const comp = this.getChipComp(column);
        if (!comp) {
            return false;
        }
        const params = this.getChipMenuParams(comp);
        const menuItems = resolveChipMenuItems(params);
        if (!menuItems.length) {
            return false;
        }
        if (anchor instanceof Event) {
            anchor.preventDefault();
            anchor.stopPropagation();
        }
        const translate = this.getLocaleTextFunc();
        this.hideMoveMenu = _showMenuListPopup(this, this.beans, {
            menuItems: createChipMenuItemDefs(menuItems, params, this.createChipMenuActions(params), translate),
            menuContext: { column, columnGroup: null, node: null, value: null },
            positionBy: anchor instanceof MouseEvent || anchor instanceof HTMLElement ? anchor : comp.getGui(),
            restoreFocus: () => this.focusChip(column),
            onClosed: () => {
                this.hideMoveMenu = undefined;
            },
        });
        return !!this.hideMoveMenu;
    }

    private getChipComp(column: AgColumn): DropZoneColumnComp | undefined {
        const comp = this.chipComps.get(column);
        return comp?.isAlive() ? comp : undefined;
    }

    private focusChip(column: AgColumn): void {
        this.getChipComp(column)?.getGui().focus({ preventScroll: true });
    }

    private getChipMenuParams(comp: DropZoneColumnComp): ChipMenuParams {
        return {
            beans: this.beans,
            column: comp.getItem(),
            zone: this.dropZonePurpose,
            horizontal: this.horizontal,
            deferMode: isDeferredMode(this.updateParams),
            isEditable: comp.isEditable(),
            sortDirection: comp.getSortDirection(),
        };
    }

    private createChipMenuActions({ column }: ChipMenuParams): ChipMenuActions {
        // Closing the menu first and refocusing the chip lets the zone's refresh move focus to a neighbouring chip.
        const closeMenuOntoChip = () => {
            this.hideMoveMenu?.();
            this.focusChip(column);
        };
        return {
            sort: (direction) => {
                closeMenuOntoChip();
                this.sortColumn(column, direction);
            },
            moveTo: (target) => {
                closeMenuOntoChip();
                this.moveColumnToZone(column, target);
            },
            canMove: (isPrevious) => {
                const comp = this.getChipComp(column);
                return !!comp && this.getItemMoveIndex(comp, isPrevious) !== null;
            },
            move: (isPrevious) => {
                closeMenuOntoChip();
                const comp = this.getChipComp(column);
                if (comp) {
                    this.moveItem(comp, isPrevious);
                }
            },
            remove: () => {
                closeMenuOntoChip();
                this.getChipComp(column)?.dispatchLocalEvent({ type: 'columnRemove' });
            },
        };
    }

    private sortColumn(column: AgColumn, direction: SortDirection): void {
        const { beans, updateParams } = this;
        const strategy = beans.columnStateUpdateStrategy;
        const deferMode = isDeferredMode(updateParams);
        if (this.dropZonePurpose === 'pivot') {
            // An explicit pivotSort switches pivot columns to strict ordering, so don't set the direction already shown.
            if (_resolvePivotSort(beans, strategy.getPivotSort(deferMode, column)) === direction) {
                return;
            }
            strategy.applyColumnState(
                deferMode,
                [{ colId: column.getColId(), pivotSort: direction }],
                'uiColumnSorted'
            );
        } else {
            strategy.setColumnSort(deferMode, column, direction, 'uiColumnSorted');
        }
        refreshDeferredToolPanelUi(beans, updateParams);
    }

    /** Moves `column` to the end of `target`, with the same model and visibility updates as dragging its chip there. */
    private moveColumnToZone(column: AgColumn, target: TDropZone): void {
        const { beans, gos, updateParams } = this;
        const strategy = beans.columnStateUpdateStrategy;
        const deferMode = isDeferredMode(updateParams);

        this.removeItemsFromModel(
            [column],
            this.getExistingItems().filter((item) => item !== column)
        );
        if (this.isRowGroupPanel() && _shouldUpdateColVisibilityAfterGroup(gos, false)) {
            this.setColumnsVisible([column], true, 'uiColumnDragged');
        }

        switch (target) {
            case 'rowGroup':
                if (_shouldUpdateColVisibilityAfterGroup(gos, true)) {
                    this.setColumnsVisible([column], false, 'uiColumnDragged');
                }
                strategy.setRowGroupColumns(
                    deferMode,
                    [...strategy.getRowGroupColumns(deferMode), column],
                    'toolPanelUi'
                );
                break;
            case 'aggregation':
                strategy.setValueColumns(deferMode, [...strategy.getValueColumns(deferMode), column], 'toolPanelUi');
                break;
            case 'pivot':
                strategy.setPivotColumns(deferMode, [...strategy.getPivotColumns(deferMode), column], 'toolPanelUi');
                break;
        }
        refreshDeferredToolPanelUi(beans, updateParams);
    }

    private shouldToggleColumnVisibility(draggingEvent: GridDraggingEvent, isGrouped: boolean): boolean {
        return (
            this.isRowGroupPanel() &&
            _shouldUpdateColVisibilityAfterGroup(this.gos, isGrouped) &&
            !draggingEvent.fromNudge
        );
    }

    protected override handleDragEnterEnd(draggingEvent: GridDraggingEvent): void {
        if (this.shouldToggleColumnVisibility(draggingEvent, true)) {
            const dragItem = draggingEvent.dragSource.getDragItem();
            const columns = dragItem.columns as AgColumn[];
            this.setColumnsVisible(columns, false, 'uiColumnDragged');
        }
    }

    protected override handleDragLeaveEnd(draggingEvent: GridDraggingEvent): void {
        if (this.shouldToggleColumnVisibility(draggingEvent, false)) {
            const dragItem = draggingEvent.dragSource.getDragItem();

            this.setColumnsVisible(dragItem.columns as AgColumn[], true, 'uiColumnDragged');
        }
    }

    public setColumnsVisible(columns: AgColumn[] | null | undefined, visible: boolean, source: ColumnEventType) {
        if (!columns) {
            return;
        }
        // In deferred mode, skip visibility changes from drag-and-drop — they will be
        // applied when the deferred state is committed. Creating hide patches here leaves
        // stale state when a column is removed then re-added to row groups.
        if (isDeferredMode(this.updateParams)) {
            return;
        }
        const allowedCols = columns.filter((c) => !c.colDef.lockVisible);
        this.beans.columnStateUpdateStrategy.setColumnsVisible(false, allowedCols, visible, source);
    }

    private isRowGroupPanel() {
        return this.dropZonePurpose === 'rowGroup';
    }

    protected createPillComponent(
        column: AgColumn,
        dropTarget: DropTarget,
        ghost: boolean,
        horizontal: boolean
    ): DropZoneColumnComp {
        return new DropZoneColumnComp(column, dropTarget, ghost, this.dropZonePurpose, horizontal, this.updateParams);
    }
}
