import { pathJoin } from './pathJoin';

describe('pathJoin', () => {
    test('undefined', () => {
        expect(pathJoin()).toBe('');
    });

    test.each`
        segments                                              | expected
        ${[]}                                                 | ${''}
        ${[undefined]}                                        | ${''}
        ${['/']}                                              | ${'/'}
        ${['/', undefined]}                                   | ${'/'}
        ${['/ag-charts']}                                     | ${'/ag-charts'}
        ${['/', 'ag-charts']}                                 | ${'/ag-charts'}
        ${['/', 'ag-charts', 'page']}                         | ${'/ag-charts/page'}
        ${['/', 'ag-charts', 'page/']}                        | ${'/ag-charts/page'}
        ${['/', 'ag-charts', '/', 'page/']}                   | ${'/ag-charts/page'}
        ${['https://ag-charts.com', 'charts', '/', 'page/']}  | ${'https://ag-charts.com/charts/page'}
        ${[new URL('http://localhost:4600/'), '/ag-charts/']} | ${'http://localhost:4600/ag-charts'}
    `('returns "$expected" for $segments', ({ segments, expected }) => {
        expect(pathJoin(...segments)).toBe(expected);
    });
});
