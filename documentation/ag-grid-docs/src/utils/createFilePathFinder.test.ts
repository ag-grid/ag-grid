import { createFilePathFinder } from './createFilePathFinder';

describe.each([
    {
        baseUrl: '/user',
        globConfig: {
            sourceFolder: 'community-modules/*/dist',
            fileNameGlob: 'someFile.js',
        },
        expectedGlobPattern: '/user/community-modules/*/dist/someFile.js',
        getFilePathTest: {
            globFile: '/user/community-modules/core/dist/someFile.js',
            expected: 'someFile.js',
        },
    },
    {
        baseUrl: '/user',
        globConfig: {
            sourceFolder: 'community-modules/*/dist',
            fileNameGlob: '**/*.{cjs,js,map}',
        },
        expectedGlobPattern: '/user/community-modules/*/dist/**/*.{cjs,js,map}',
        getFilePathTest: {
            globFile: '/user/community-modules/core/dist/package/main.cjs.js',
            expected: 'package/main.cjs.js',
        },
    },
])('createFilePathFinder', ({ baseUrl, globConfig, expectedGlobPattern, getFilePathTest }) => {
    it(`${baseUrl} and ${JSON.stringify(globConfig)} outputs glob pattern: ${expectedGlobPattern}`, () => {
        const { globPattern } = createFilePathFinder({ baseUrl, globConfig });
        expect(globPattern).toEqual(expectedGlobPattern);
    });

    it(`${expectedGlobPattern} getFilePath, test ${getFilePathTest.globFile} outputs: ${getFilePathTest.expected}`, () => {
        const { globFile, expected } = getFilePathTest;
        const { getFilePath } = createFilePathFinder({ baseUrl, globConfig });
        expect(getFilePath(globFile)).toEqual(expected);
    });
});
