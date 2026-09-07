import { getErrorRedirectBaseUrl } from './getErrorRedirectBaseUrl';

describe.each([
    { errorVersion: '32.2.0', pageVersion: '32.2.0', output: undefined },
    { errorVersion: undefined, pageVersion: '32.2.0', output: undefined },
    { errorVersion: '32.2.0-beta.20241122.1041', pageVersion: '32.2.0', output: undefined },
    { errorVersion: '32.2.0', pageVersion: '33.0.0', output: 'https://www.ag-grid.com/archive/32.2.0' },
    // The archive is published per release, so a pre-release tag has to be dropped from the path —
    // `isVersionMatch` already ignores it when deciding whether to redirect at all.
    {
        errorVersion: '35.3.0-beta.20260619.1053',
        pageVersion: '36.1.0',
        output: 'https://www.ag-grid.com/archive/35.3.0',
    },
])('getErrorRedirectBaseUrl', ({ errorVersion, pageVersion, output }) => {
    it(`errorVersion: ${errorVersion} and pageVersion: ${pageVersion}, outputs ${output}`, () => {
        expect(getErrorRedirectBaseUrl({ errorVersion, pageVersion })).toEqual(output);
    });
});
