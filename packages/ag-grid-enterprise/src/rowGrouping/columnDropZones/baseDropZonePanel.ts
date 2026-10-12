import type {
    AgColumn,
    ColumnEventType,
    DefaultColumnDropZoneMenuItem,
    DragItem,
    DropTarget,
    GridDraggingEvent,
    MenuItemDef,
} from 'ag-grid-community';
import { DragSourceType, _createIconNoSpan, _shouldUpdateColVisibilityAfterGroup } from 'ag-grid-community';

import { isDeferredMode } from '../../columnToolPanel/toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from '../../columnToolPanel/updates/columnStateUpdateTypes';
import { MENU_ITEM_SEPARATOR, _normaliseSeparators } from '../../menu/menuSeparators';
import { _showMenuListPopup } from '../../widgets/menuPopupUtils';
import type { PillDropZonePanelParams } from '../../widgets/pillDropZonePanel';
import { PillDropZonePanel } from '../../widgets/pillDropZonePanel';
import { DropZoneColumnComp } from './dropZoneColumnComp';

export type TDropZone = 'rowGroup' | 'pivot' | 'aggregation';

export abstract class BaseDropZonePanel extends PillDropZonePanel<DropZoneColumnComp, AgColumn> {
    protected readonly embedded: boolean;
    private hideMoveMenu?: () => void;

    constructor(
        horizontal: boolean,
        private readonly dropZonePurpose: TDropZone,
        protected readonly updateParams?: ColumnStateUpdateParams,
        embedded = false
    ) {
        super(horizontal);
        this.embedded = embedded;
        this.addElementClasses(this.getGui(), this.dropZonePurpose.toLowerCase());
    }

    public override init(params: PillDropZonePanelParams): void {
        super.init(params);
        this.addDestroyFunc(() => this.hideMoveMenu?.());

        this.addManagedEventListeners({ newColumnsLoaded: this.refreshGui.bind(this) });

        this.addManagedPropertyListeners(
            [
                'functionsReadOnly',
                'rowGroupPanelSuppressSort',
                'groupLockGroupColumns',
                'getColumnDropZoneMenuItems',
                'suppressMovableColumns',
            ],
            this.refreshGui.bind(this)
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

        return !sourceElement.hasAttribute('data-column-tool-panel-deferred');
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
        super.refreshGui();
    }

    protected override createItemComponent(column: AgColumn, ghost: boolean): DropZoneColumnComp {
        const comp = super.createItemComponent(column, ghost);
        if (!ghost) {
            if (this.getMenuConfig(comp).menuItems.length) {
                comp.getGui().setAttribute('aria-haspopup', 'menu');
            }
            comp.addGuiEventListener('contextmenu', (event: MouseEvent) => this.showMoveMenu(comp, event));
            comp.addGuiEventListener('keydown', (event: KeyboardEvent) => {
                if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
                    this.showMoveMenu(comp, event);
                }
            });
        }
        return comp;
    }

    private isMoveSuppressed(column: AgColumn): boolean {
        return !!(
            this.gos.get('suppressMovableColumns') ||
            column.colDef.suppressMovable ||
            column.colDef.lockPosition
        );
    }

    private getMenuConfig(comp: DropZoneColumnComp) {
        const { horizontal, gos } = this;
        const column = comp.getItem();
        const isRtlHorizontal = horizontal && gos.get('enableRtl');
        const directions = horizontal ? (['Left', 'Right'] as const) : (['Up', 'Down'] as const);
        const moveItems = new Map<
            DefaultColumnDropZoneMenuItem,
            { direction: (typeof directions)[number]; isPrevious: boolean }
        >();
        const suppressMove = this.isMoveSuppressed(column);
        for (let index = 0; !suppressMove && index < directions.length; ++index) {
            const direction = directions[index];
            const isTowardStart = index === 0;
            const isPrevious = isTowardStart !== isRtlHorizontal;
            moveItems.set(`move${direction}`, { direction, isPrevious });
        }
        const defaultItems = Array.from(moveItems.keys());
        const items =
            gos.getCallback('getColumnDropZoneMenuItems')?.({
                column,
                purpose: this.dropZonePurpose,
                defaultItems,
            }) ?? defaultItems;
        const menuItems = items.filter(
            (item) => typeof item !== 'string' || item === MENU_ITEM_SEPARATOR || moveItems.has(item)
        );
        _normaliseSeparators(menuItems, MENU_ITEM_SEPARATOR);
        return { menuItems, moveItems };
    }

    private showMoveMenu(comp: DropZoneColumnComp, event: MouseEvent | KeyboardEvent): void {
        this.hideMoveMenu?.();
        const { menuItems, moveItems } = this.getMenuConfig(comp);
        if (!menuItems.length) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const translate = this.getLocaleTextFunc();
        const column = comp.getItem();
        this.hideMoveMenu = _showMenuListPopup(this, this.beans, {
            menuItems: menuItems.map<MenuItemDef | 'separator'>((item) => {
                if (typeof item !== 'string' || item === MENU_ITEM_SEPARATOR) {
                    return item;
                }
                const { direction, isPrevious } = moveItems.get(item)!;
                return {
                    name: translate(item, `Move ${direction}`),
                    icon: _createIconNoSpan(`menuMove${direction}`, this.beans, column),
                    disabled: this.getItemMoveIndex(comp, isPrevious) === null,
                    action: () => {
                        this.hideMoveMenu?.();
                        if (!this.isMoveSuppressed(column)) {
                            this.moveItem(comp, isPrevious);
                        }
                    },
                };
            }),
            menuContext: { column, columnGroup: null, node: null, value: null },
            positionBy: event instanceof MouseEvent ? event : comp.getGui(),
            restoreFocus: () => {
                if (comp.isAlive()) {
                    comp.getGui().focus({ preventScroll: true });
                }
            },
            onClosed: () => {
                this.hideMoveMenu = undefined;
            },
        });
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
