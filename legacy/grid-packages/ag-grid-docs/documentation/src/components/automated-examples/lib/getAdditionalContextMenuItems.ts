import { MenuItemDef } from 'ag-grid-community';

export function getAdditionalContextMenuItems(items: (string | MenuItemDef)[]) {
    return [
        'cut',
        'copy',
        'copyWithHeaders',
        'copyWithGroupHeaders',
        'paste',
        'separator',
        'chartRange',
        'export',
        'separator',
        ...items,
    ];
}
