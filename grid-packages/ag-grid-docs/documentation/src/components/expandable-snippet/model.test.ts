import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';

jest.mock('../documentation-helpers');
jest.mock('../use-json-file-nodes');

import * as fs from 'fs';
import { buildModel, loadLookups } from './model';
import { getJsonFromFile } from '../documentation-helpers';

describe('ExpandableSnippet Model', () => {
    let mockInterfaces: {};
    let mockDocInterfaces: {};
    let mockOverrides: {};

    let loadedInterfaces: {};
    let loadedDocInterfaces: {};

    beforeAll(() => {
        mockInterfaces = JSON.parse(fs.readFileSync('./doc-pages/grid-api/interfaces.AUTO.json').toString());
        mockDocInterfaces = JSON.parse(fs.readFileSync('./doc-pages/grid-api/doc-interfaces.AUTO.json').toString());
        mockOverrides = JSON.parse(fs.readFileSync('./doc-pages/charts-api/api.json').toString());
        (getJsonFromFile as any)
            .mockReturnValueOnce(mockInterfaces)
            .mockReturnValueOnce(mockDocInterfaces)
            .mockReturnValueOnce(mockOverrides);
    
        const loaded = loadLookups('overrides.test.json');
        loadedInterfaces = loaded.interfaceLookup;
        loadedDocInterfaces = loaded.codeLookup;
    });

    for (const root of ['AgCartesianChartOptions']) {
        describe(`for ${root}`, () => {
            it('builds a consistent model', () => {
                const model = buildModel(root, loadedInterfaces, loadedDocInterfaces);
        
                expect(model).toMatchSnapshot();
            });
        });
    }
});
