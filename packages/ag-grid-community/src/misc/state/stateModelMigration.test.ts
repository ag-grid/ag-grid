import fs from 'fs';
import path from 'path';

import type { GridState } from '../../interfaces/gridState';
import { VERSION } from '../../version';
import { migrateGridStateModel } from './stateModelMigration';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function loadFixtures(): [name: string, version: string | undefined, state: GridState][] {
    return fs
        .readdirSync(FIXTURES_DIR)
        .filter((f) => f.endsWith('.json'))
        .map((file) => {
            const contents = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf-8')) as GridState;
            return [file, contents.version, contents];
        });
}

describe('Grid State Migration', () => {
    test.each(loadFixtures())('%s: should upgrade version %s', (name, version, state) => {
        const migrated = migrateGridStateModel(state);
        expect(migrated).toEqual({
            cellSelection: {
                cellRanges: [],
            },
            rangeSelection: {
                cellRanges: [],
            },
            sort: {
                sortModel: [],
            },
            version: VERSION,
        });
    });

    test('a version-less state with cellSelection and no rangeSelection keeps its cellSelection', () => {
        const cellSelection = { cellRanges: [{ id: '1' }] } as unknown as GridState['cellSelection'];
        const migrated = migrateGridStateModel({ cellSelection } as GridState);

        expect(migrated.cellSelection).toBe(cellSelection);
        expect(migrated.rangeSelection).toBeUndefined();
    });

    test('a version-less state with only rangeSelection still copies it to cellSelection', () => {
        const rangeSelection = { cellRanges: [{ id: '1' }] } as unknown as GridState['rangeSelection'];
        const migrated = migrateGridStateModel({ rangeSelection } as GridState);

        expect(migrated.cellSelection).toEqual(rangeSelection);
        expect(migrated.rangeSelection).toEqual(rangeSelection);
    });
});
