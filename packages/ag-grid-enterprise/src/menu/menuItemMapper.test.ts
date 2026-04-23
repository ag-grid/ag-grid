import type { MenuItemDef } from 'ag-grid-community';

import { MENU_ITEM_SEPARATOR, _normaliseSeparators } from './menuItemMapper';

describe('_normaliseSeparators', () => {
    it('removes leading, trailing and repeated separators', () => {
        const copyItem: MenuItemDef = { name: 'Copy' };
        const exportItem: MenuItemDef = { name: 'Export' };
        const items = [
            MENU_ITEM_SEPARATOR,
            copyItem,
            MENU_ITEM_SEPARATOR,
            MENU_ITEM_SEPARATOR,
            exportItem,
            MENU_ITEM_SEPARATOR,
        ];

        _normaliseSeparators(items, MENU_ITEM_SEPARATOR);

        expect(items).toEqual([copyItem, MENU_ITEM_SEPARATOR, exportItem]);
    });

    it('removes note separators when notes are the only menu section', () => {
        const addNoteItem: MenuItemDef = { name: 'Add Note' };
        const items = [MENU_ITEM_SEPARATOR, addNoteItem, MENU_ITEM_SEPARATOR];

        _normaliseSeparators(items, MENU_ITEM_SEPARATOR);

        expect(items).toEqual([addNoteItem]);
    });
});
