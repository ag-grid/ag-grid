import type { GridOptions } from './entities/gridOptions';
import type { GridOptionsService } from './gridOptionsService';
import { _getEnableDeselection, _getEnableSelection } from './gridOptionsUtils';

const gosWith = (rowSelection: GridOptions['rowSelection']) =>
    ({ get: (key: string) => (key === 'rowSelection' ? rowSelection : undefined) }) as unknown as GridOptionsService;

describe('click selection helpers', () => {
    test('enable click selection and deselection when rowSelection is unset', () => {
        const gos = gosWith(undefined);
        expect(_getEnableSelection(gos)).toBe(true);
        expect(_getEnableDeselection(gos)).toBe(true);
    });

    test('disable click selection and deselection by default for the rowSelection object', () => {
        const gos = gosWith({ mode: 'multiRow' });
        expect(_getEnableSelection(gos)).toBe(false);
        expect(_getEnableDeselection(gos)).toBe(false);
    });
});
