import { beforeAll, beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import * as fs from 'fs';
import { getJsonFromFile } from './documentation-helpers';
import { loadLookups } from './expandable-snippet/model';

jest.mock('./documentation-helpers');
jest.mock('./use-json-file-nodes');

/**
 * Generated using:
 * ```bash
 * (
 *      cd grid-packages/ag-grid-docs/documentation &&
 *          find . -name \*.md -exec grep -oi "overridesrc=[a-zA-Z\\.\"\'/\\-]*" \{\} \; |
 *          sort |
 *          uniq
 * )
 * ```
 */
const OVERRIDES_TO_TEST = [
    'component-date/resources/dateParams.json',
    'filter-date/resources/date-filter-params.json',
    'filter-number/resources/number-filter-params.json',
    'filter-provided/resources/provided-filters.json',
    'filter-text/resources/text-filter-params.json',
    'filter-multi/resources/multi-filter.json',
    'filter-set-api/resources/iSetFilter.json',
    'filter-set/resources/set-filter-params.json',
    'group-cell-renderer/group-cell-renderer.json',
    'integrated-charts-api-cross-filter-chart/resources/cross-filter-api.json',
    'integrated-charts-api-pivot-chart/resources/chart-api.json',
    'integrated-charts-api-range-chart/resources/chart-api.json',
    'side-bar/resources/sideBar.json',
    'sparklines-area-customisation/resources/area-sparkline-api.json',
    'sparklines-bar-customisation/resources/bar-sparkline-api.json',
    'sparklines-column-customisation/resources/column-sparkline-api.json',
    'sparklines-line-customisation/resources/line-sparkline-api.json',
    'sparklines-tooltips/resources/sparkline-tooltip-api.json',
];
const CHARTS_OVERRIDES_TO_TEST = [
    'charts-api/api.json',
];
const BASE_PATH = './doc-pages';

describe('Documentation Overrides Sanity Check', () => {
    let interfaces: {};
    let docInterfaces: {};
    let originalConsoleWarn;

    beforeEach(() => {
        originalConsoleWarn = console.warn;
        console.warn = jest.fn();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });

    describe('for Grid', () => {
        beforeAll(() => {
            interfaces = JSON.parse(fs.readFileSync(`${BASE_PATH}/grid-api/interfaces.AUTO.json`).toString());
            docInterfaces = JSON.parse(fs.readFileSync(`${BASE_PATH}/grid-api/doc-interfaces.AUTO.json`).toString());
        });
    
        describe.each(OVERRIDES_TO_TEST)('Verify %s', (override) => {
            beforeEach(() => {
                const overrides = JSON.parse(fs.readFileSync(`${BASE_PATH}/${override}`).toString());
    
                (getJsonFromFile as any)
                    .mockReturnValueOnce(interfaces)
                    .mockReturnValueOnce(docInterfaces)
                    .mockReturnValueOnce(overrides);
            });
    
            it('should load and parse without error', () => {
                expect(() => loadLookups('test', {}, override)).not.toThrowError();
                expect(console.warn).not.toBeCalled();
            });
        });
    });

    describe('for Charts', () => {
        beforeAll(() => {
            interfaces = JSON.parse(fs.readFileSync(`${BASE_PATH}/charts-api/interfaces.AUTO.json`).toString());
            docInterfaces = JSON.parse(fs.readFileSync(`${BASE_PATH}/charts-api/doc-interfaces.AUTO.json`).toString());
        });
    
        describe.each(CHARTS_OVERRIDES_TO_TEST)('Verify %s', (override) => {
            beforeEach(() => {
                const overrides = JSON.parse(fs.readFileSync(`${BASE_PATH}/${override}`).toString());
    
                (getJsonFromFile as any)
                    .mockReturnValueOnce(interfaces)
                    .mockReturnValueOnce(docInterfaces)
                    .mockReturnValueOnce(overrides);
            });
    
            it('should load and parse without error', () => {
                expect(() => loadLookups('test', {}, override)).not.toThrowError();
                expect(console.warn).not.toBeCalled();
            });
        });
    });
});
