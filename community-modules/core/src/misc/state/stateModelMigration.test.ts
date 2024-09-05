import fs from 'fs';
import path from 'path';

import type { GridState } from '../../interfaces/gridState';
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
        expect(migrated).toMatchSnapshot();
    });
});
