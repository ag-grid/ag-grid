import type { AgColumn } from '../../entities/agColumn';
import type { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../../entities/colDef';
import type { GridOptions } from '../../entities/gridOptions';
import type { GridOptionsService } from '../../gridOptionsService';
import type { GetColumnMenuItemsParams } from '../../interfaces/iCallbackParams';
import type { MenuItemDef } from '../../interfaces/menuItem';
import { _resolveColumnMenuItems } from './columnMenuItemsResolver';

function makeGos(gridOptions: Partial<GridOptions>): GridOptionsService {
    return {
        addCommon: (params: any) => ({ ...params, api: {}, context: undefined }),
        getCallback: (key: keyof GridOptions) => {
            const cb = gridOptions[key] as any;
            return cb ? (params: any) => cb({ ...params, api: {}, context: undefined }) : undefined;
        },
    } as unknown as GridOptionsService;
}

function makeColumn(colDef: ColDef): AgColumn {
    return { colDef } as unknown as AgColumn;
}

function makeColumnGroup(colGroupDef: ColGroupDef): AgProvidedColumnGroup {
    return { getColGroupDef: () => colGroupDef } as unknown as AgProvidedColumnGroup;
}

const CUSTOM: MenuItemDef = { name: 'Custom' };
const DEFAULTS = ['sortAscending', 'sortDescending'] as any;

describe('_resolveColumnMenuItems', () => {
    it('returns the columnMenuItems list when the column provides one', () => {
        const column = makeColumn({ columnMenuItems: [CUSTOM] });
        const result = _resolveColumnMenuItems(makeGos({}), column, null, 'columnsToolPanel', DEFAULTS);
        expect(result).toEqual([CUSTOM]);
    });

    it('calls the columnMenuItems callback with the source and default items, and returns its result', () => {
        const spy = vi.fn((params: GetColumnMenuItemsParams) => [...params.defaultItems, CUSTOM]);
        const column = makeColumn({ columnMenuItems: spy });
        const result = _resolveColumnMenuItems(makeGos({}), column, null, 'columnsToolPanel', DEFAULTS);
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({ source: 'columnsToolPanel', defaultItems: DEFAULTS })
        );
        expect(result).toEqual([...DEFAULTS, CUSTOM]);
    });

    it('falls back to the grid getColumnMenuItems callback when the column has no columnMenuItems', () => {
        const spy = vi.fn((_params: GetColumnMenuItemsParams) => [CUSTOM]);
        const result = _resolveColumnMenuItems(
            makeGos({ getColumnMenuItems: spy }),
            makeColumn({}),
            null,
            'columnChooser',
            DEFAULTS
        );
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ source: 'columnChooser' }));
        expect(result).toEqual([CUSTOM]);
    });

    it('prefers the column columnMenuItems over the grid getColumnMenuItems callback', () => {
        const gridSpy = vi.fn(() => [CUSTOM]);
        const column = makeColumn({ columnMenuItems: [{ name: 'FromColumn' }] });
        const result = _resolveColumnMenuItems(
            makeGos({ getColumnMenuItems: gridSpy }),
            column,
            null,
            'columnMenu',
            DEFAULTS
        );
        expect(gridSpy).not.toHaveBeenCalled();
        expect(result).toEqual([{ name: 'FromColumn' }]);
    });

    it('reads columnMenuItems from a column group definition', () => {
        const columnGroup = makeColumnGroup({ children: [], columnMenuItems: [CUSTOM] });
        const result = _resolveColumnMenuItems(makeGos({}), null, columnGroup, 'columnsToolPanel', DEFAULTS);
        expect(result).toEqual([CUSTOM]);
    });

    describe('legacy fallback', () => {
        it('uses the legacy mainMenuItems on the column menu when no columnMenuItems are set', () => {
            const column = makeColumn({ mainMenuItems: [CUSTOM] });
            const result = _resolveColumnMenuItems(makeGos({}), column, null, 'columnMenu', DEFAULTS);
            expect(result).toEqual([CUSTOM]);
        });

        it('uses the legacy getMainMenuItems on the column menu when no new callbacks are set', () => {
            const legacy = vi.fn(() => [CUSTOM]);
            const result = _resolveColumnMenuItems(
                makeGos({ getMainMenuItems: legacy }),
                makeColumn({}),
                null,
                'columnMenu',
                DEFAULTS
            );
            expect(legacy).toHaveBeenCalled();
            expect(result).toEqual([CUSTOM]);
        });

        it('ignores the legacy properties on the tool panel and chooser, returning the default items', () => {
            const legacy = vi.fn(() => [CUSTOM]);
            const column = makeColumn({ mainMenuItems: [{ name: 'legacyArray' }] });
            const result = _resolveColumnMenuItems(
                makeGos({ getMainMenuItems: legacy }),
                column,
                null,
                'columnsToolPanel',
                DEFAULTS
            );
            expect(legacy).not.toHaveBeenCalled();
            expect(result).toEqual(DEFAULTS);
        });
    });

    it('returns the default items when nothing is configured', () => {
        const result = _resolveColumnMenuItems(makeGos({}), makeColumn({}), null, 'columnMenu', DEFAULTS);
        expect(result).toBe(DEFAULTS);
    });
});
