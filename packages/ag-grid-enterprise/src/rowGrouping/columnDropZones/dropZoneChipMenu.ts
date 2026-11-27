import type {
    AgColumn,
    BeanCollection,
    DefaultColumnDropZoneMenuItem,
    IconName,
    MenuItemDef,
    SortDirection,
} from 'ag-grid-community';
import { _createIconNoSpan, _isSortTypeAvailable } from 'ag-grid-community';

import { MENU_ITEM_SEPARATOR, _normaliseSeparators } from '../../menu/menuSeparators';
import type { TDropZone } from './baseDropZonePanel';

export type ChipMenuItem = DefaultColumnDropZoneMenuItem | MenuItemDef;

/** The chip's state, read once when its menu is built. */
export interface ChipMenuParams {
    beans: BeanCollection;
    column: AgColumn;
    zone: TDropZone;
    horizontal: boolean;
    deferMode: boolean;
    isEditable: boolean;
    /** The direction the chip's sort indicator shows. */
    sortDirection: SortDirection;
}

/** What the chip's menu items do; they must not hold on to the chip, which a model change destroys. */
export interface ChipMenuActions {
    sort(direction: SortDirection): void;
    moveTo(target: TDropZone): void;
    canMove(isPrevious: boolean): boolean;
    move(isPrevious: boolean): void;
    remove(): void;
}

const SORT_ITEMS = new Map<DefaultColumnDropZoneMenuItem, { label: string; icon: IconName; direction: SortDirection }>([
    ['sortAscending', { label: 'Sort Ascending', icon: 'sortAscending', direction: 'asc' }],
    ['sortDescending', { label: 'Sort Descending', icon: 'sortDescending', direction: 'desc' }],
    ['sortUnSort', { label: 'Clear Sort', icon: 'sortUnSort', direction: null }],
]);

const MOVE_TO_ITEMS = new Map<DefaultColumnDropZoneMenuItem, { label: string; icon: IconName; target: TDropZone }>([
    ['moveToRowGroups', { label: 'Move to Row Groups', icon: 'rowGroupPanel', target: 'rowGroup' }],
    ['moveToValues', { label: 'Move to Values', icon: 'valuePanel', target: 'aggregation' }],
    ['moveToColumnLabels', { label: 'Move to Column Labels', icon: 'pivotPanel', target: 'pivot' }],
]);

/** The built-in items that apply to the chip, in default order. */
function getDefaultChipMenuItems(params: ChipMenuParams): DefaultColumnDropZoneMenuItem[] {
    const items: DefaultColumnDropZoneMenuItem[] = [
        ...getSortItems(params),
        MENU_ITEM_SEPARATOR,
        ...getMoveToItems(params),
        MENU_ITEM_SEPARATOR,
        ...getChipMoveItems(params).keys(),
        MENU_ITEM_SEPARATOR,
        'removeField',
    ];
    _normaliseSeparators(items, MENU_ITEM_SEPARATOR);
    return items;
}

/** The chip's menu: the `getColumnDropZoneMenuItems` result, keeping only the built-in items that apply. */
export function resolveChipMenuItems(params: ChipMenuParams): ChipMenuItem[] {
    const { beans, column, zone } = params;
    const defaultItems = getDefaultChipMenuItems(params);
    const applicable = new Set<DefaultColumnDropZoneMenuItem>(defaultItems);
    const items =
        beans.gos.getCallback('getColumnDropZoneMenuItems')?.({ column, source: zone, defaultItems }) ?? defaultItems;
    const menuItems = items.filter(
        (item) => typeof item !== 'string' || item === MENU_ITEM_SEPARATOR || applicable.has(item)
    );
    _normaliseSeparators(menuItems, MENU_ITEM_SEPARATOR);
    return menuItems;
}

export function createChipMenuItemDefs(
    items: ChipMenuItem[],
    params: ChipMenuParams,
    actions: ChipMenuActions,
    translate: (key: string, defaultValue: string) => string
): (MenuItemDef | 'separator')[] {
    const { beans, column, isEditable } = params;
    const moveItems = getChipMoveItems(params);
    const icon = (name: IconName) => _createIconNoSpan(name, beans, column);

    return items.map<MenuItemDef | 'separator'>((item) => {
        if (typeof item !== 'string' || item === MENU_ITEM_SEPARATOR) {
            return item;
        }
        if (item === 'removeField') {
            return {
                name: translate('removeField', 'Remove Field'),
                icon: icon('cancel'),
                disabled: !isEditable,
                action: () => actions.remove(),
            };
        }
        const sortItem = SORT_ITEMS.get(item);
        if (sortItem) {
            return {
                name: translate(item, sortItem.label),
                icon: icon(sortItem.icon),
                action: () => actions.sort(sortItem.direction),
            };
        }
        const moveToItem = MOVE_TO_ITEMS.get(item);
        if (moveToItem) {
            return {
                name: translate(item, moveToItem.label),
                icon: icon(moveToItem.icon),
                action: () => actions.moveTo(moveToItem.target),
            };
        }
        // Only applicable tokens reach here, so what remains is a move item.
        const { direction, isPrevious } = moveItems.get(item)!;
        return {
            name: translate(item, `Move ${direction}`),
            icon: icon(`menuMove${direction}`),
            disabled: !actions.canMove(isPrevious),
            action: () => actions.move(isPrevious),
        };
    });
}

function getSortItems(params: ChipMenuParams): DefaultColumnDropZoneMenuItem[] {
    const { beans, column, sortDirection } = params;
    if (
        !beans.sortSvc ||
        !column.isSortable() ||
        !_isSortTypeAvailable(column, 'default') ||
        isSortSuppressed(params)
    ) {
        return [];
    }
    return sortDirection ? ['sortAscending', 'sortDescending', 'sortUnSort'] : ['sortAscending', 'sortDescending'];
}

function getMoveToItems(params: ChipMenuParams): DefaultColumnDropZoneMenuItem[] {
    const items: DefaultColumnDropZoneMenuItem[] = [];
    for (const [item, { target }] of MOVE_TO_ITEMS) {
        if (isMoveToApplicable(params, target)) {
            items.push(item);
        }
    }
    return items;
}

function isSortSuppressed({ beans, zone, deferMode }: ChipMenuParams): boolean {
    switch (zone) {
        case 'rowGroup':
            return !!beans.gos.get('rowGroupPanelSuppressSort');
        case 'pivot':
            return !!beans.gos.get('pivotPanelSuppressSort');
        case 'aggregation':
            return beans.columnStateUpdateStrategy.getPivotMode(deferMode);
    }
}

function isMoveToApplicable(
    { beans, column, zone, deferMode, isEditable }: ChipMenuParams,
    target: TDropZone
): boolean {
    if (target === zone || !isEditable || !column.primary) {
        return false;
    }
    const strategy = beans.columnStateUpdateStrategy;
    switch (target) {
        case 'rowGroup':
            return (
                column.isAllowRowGroup() &&
                !column.showRowGroup &&
                !strategy.getRowGroupColumns(deferMode).includes(column)
            );
        case 'aggregation':
            return column.isAllowValue() && !strategy.getValueColumns(deferMode).includes(column);
        case 'pivot':
            return (
                column.isAllowPivot() &&
                strategy.getPivotMode(deferMode) &&
                !strategy.getPivotColumns(deferMode).includes(column)
            );
    }
}

function getChipMoveItems({ beans, horizontal }: ChipMenuParams) {
    const isRtlHorizontal = horizontal && beans.gos.get('enableRtl');
    const directions = horizontal ? (['Left', 'Right'] as const) : (['Up', 'Down'] as const);
    const moveItems = new Map<
        DefaultColumnDropZoneMenuItem,
        { direction: (typeof directions)[number]; isPrevious: boolean }
    >();
    for (let index = 0; index < directions.length; ++index) {
        const direction = directions[index];
        const isTowardStart = index === 0;
        moveItems.set(`move${direction}`, { direction, isPrevious: isTowardStart !== isRtlHorizontal });
    }
    return moveItems;
}
