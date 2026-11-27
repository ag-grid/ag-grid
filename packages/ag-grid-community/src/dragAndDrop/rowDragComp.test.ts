import { _getLocaleTextFromMap } from 'ag-stack';

import { _getRowDragCountText } from './rowDragComp';

describe('_getRowDragCountText', () => {
    test('uses the singular word for one row and the plural for more', () => {
        const translate = _getLocaleTextFromMap();

        expect(_getRowDragCountText(translate, 1)).toBe('1 row');
        expect(_getRowDragCountText(translate, 3)).toBe('3 rows');
    });

    test('lets a locale place the count', () => {
        const translate = _getLocaleTextFromMap({ rowDragRowCount: '${count}行' });

        expect(_getRowDragCountText(translate, 3)).toBe('3行');
    });
});
