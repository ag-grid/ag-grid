import { resolveSharedUrl } from '@ag-website-shared/utils/resolveSharedUrl';

vi.mock('@ag-website-shared/utils/gridUrlWithPrefix', () => ({
    gridUrlWithPrefix: ({ url, framework }: { url: string; framework?: string }) =>
        `GRID/${framework}/${url.slice('./'.length)}`,
}));

vi.mock('@ag-website-shared/utils/chartsUrlWithPrefix', () => ({
    chartsUrlWithPrefix: ({ url, framework }: { url: string; framework?: string }) =>
        `CHARTS/${framework}/${url.slice('./'.length)}`,
}));

describe('resolveSharedUrl', () => {
    test.each`
        url                           | framework    | expected
        ${'grid:./mcp-server/'}       | ${'react'}   | ${'GRID/react/mcp-server/'}
        ${'grid:./filter-text/'}      | ${'angular'} | ${'GRID/angular/filter-text/'}
        ${'grid:./page/#section'}     | ${'react'}   | ${'GRID/react/page/#section'}
        ${'charts:./bar-series/'}     | ${'react'}   | ${'CHARTS/react/bar-series/'}
        ${'charts:./overview/'}       | ${'vue3'}    | ${'CHARTS/vue3/overview/'}
        ${'./local-page/'}            | ${'react'}   | ${'./local-page/'}
        ${'https://www.ag-grid.com/'} | ${'react'}   | ${'https://www.ag-grid.com/'}
    `('$url (framework=$framework) -> $expected', ({ url, framework, expected }) => {
        expect(resolveSharedUrl({ url, framework })).toBe(expected);
    });
});
