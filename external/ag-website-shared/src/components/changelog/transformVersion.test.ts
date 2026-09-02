import { transformVersion } from './transformVersion';

describe.each([
    { gridVersion: '34.0.2', chartVersion: '12.0.2' },
    { gridVersion: '22.0.0', chartVersion: '0.0.0' },
    { gridVersion: 'Next', chartVersion: null },
    { gridVersion: '', chartVersion: null },
    { gridVersion: '34.0', chartVersion: null },
    { gridVersion: '34.0.x', chartVersion: null },
])('transformVersion.charts', ({ gridVersion, chartVersion }) => {
    it(`grid version: "${gridVersion}" transforms to ${JSON.stringify(chartVersion)}`, () => {
        expect(transformVersion.charts(gridVersion)).toEqual(chartVersion);
    });
});
