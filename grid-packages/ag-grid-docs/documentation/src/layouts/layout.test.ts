import {describe, it, expect, beforeEach, beforeAll, jest} from '@jest/globals';

import * as fs from 'fs';
import {FULL_SCREEN_PAGES, FULL_SCREEN_WITH_FOOTER_PAGES, getScreenLayout} from './index.js';

const flattenArray = (array: any) => [].concat.apply([], array);

const roots = [
    'testing.ag-grid.com/AG-3390',
    'www.ag-grid.com/archive/29.0.0',
    'ag-grid.com',
    'build.ag-grid.com'
]

const getPathVariations = (path: string) => [`${path}/`, path];
const getPageVariations = (page: string) => flattenArray(
    roots.map(root => `http://${root}`).concat(roots.map(root => `https://${root}`)).map(path => getPathVariations(`${path}/${page}`))
)

describe('full screen pages', () => {
    const fullScreenPaths = flattenArray(FULL_SCREEN_PAGES.map((page: string) => getPageVariations(page)));

    for (const fullScreenPath of fullScreenPaths) {
        it(`${fullScreenPath} should be a full screen page`, () => {
            const {fullScreenPage} = getScreenLayout(fullScreenPath);
            expect(fullScreenPage).toBe(true);
        })
    }
});

describe('full screen with footer pages', () => {
    const fullScreenPaths = flattenArray(FULL_SCREEN_WITH_FOOTER_PAGES.map((page: string) => getPageVariations(page)));

    for (const fullScreenPath of fullScreenPaths) {
        it(`${fullScreenPath} should be a full screen with footer page`, () => {
            const {fullScreenWithFooter} = getScreenLayout(fullScreenPath);
            expect(fullScreenWithFooter).toBe(true);
        })
    }
});

describe('full screen with footer pages with query params', () => {
    const fullScreenPaths = flattenArray(
        flattenArray(
            ['changelog', 'pipeline'].map((page: string) => getPageVariations(page))).map((path: string) => [`${path}?fixVersion=29.0.0`,`${path}?searchQuery=7955`]
        )
    );

    for (const fullScreenPath of fullScreenPaths) {
        it(`${fullScreenPath} should be a full screen with footer page`, () => {
            const {fullScreenWithFooter} = getScreenLayout(fullScreenPath);
            expect(fullScreenWithFooter).toBe(true);
        })
    }
});
