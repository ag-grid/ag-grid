import {
    getExampleCodeSandboxUrl,
    getExampleContentsUrl,
    getExampleFileUrl,
    getExampleLinkUrl,
    getExamplePlunkrUrl,
    getExampleRunnerExampleUrl,
    getExampleUrl,
} from './urlPaths';

const params = {
    internalFramework: 'vanilla',
    pageName: 'column-sizing',
    exampleName: 'flex-columns',
} as const;

describe('example urls', () => {
    const exampleUrl = getExampleUrl(params);

    // Every one of these is a built page, ie a directory index. Without the trailing slash the
    // server answers with a 301 to the slashed url, which is a wasted hop on every embedded example.
    test.each`
        name                | url
        ${'example page'}   | ${getExampleLinkUrl(params)}
        ${'example runner'} | ${getExampleRunnerExampleUrl(params)}
        ${'plunkr'}         | ${getExamplePlunkrUrl(params)}
        ${'codesandbox'}    | ${getExampleCodeSandboxUrl(params)}
    `('$name url ends with a trailing slash', ({ url }) => {
        expect(url.endsWith('/')).toBe(true);
    });

    // These are files, not pages, so a trailing slash would break them.
    test.each`
        name               | url                                                      | expected
        ${'contents.json'} | ${getExampleContentsUrl(params)}                         | ${`${exampleUrl}/contents.json`}
        ${'example file'}  | ${getExampleFileUrl({ ...params, fileName: 'main.js' })} | ${`${exampleUrl}/main.js`}
    `('$name url is the slash-less example url plus the file name', ({ url, expected }) => {
        expect(url).toBe(expected);
    });

    test('the example page url is the file base url plus a trailing slash', () => {
        expect(getExampleLinkUrl(params)).toBe(`${exampleUrl}/`);
    });
});
