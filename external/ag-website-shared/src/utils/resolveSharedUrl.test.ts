import { resolveSharedUrl } from '@ag-website-shared/utils/resolveSharedUrl';
import { vi } from 'vitest';

vi.mock('@ag-website-shared/utils/gridUrlWithPrefix', () => ({
    gridUrlWithPrefix: ({ url, framework }: { url: string; framework?: string }) =>
        `https://www.ag-grid.com/${framework}-data-grid/${url.slice('./'.length)}`,
}));

vi.mock('@ag-website-shared/utils/chartsUrlWithPrefix', () => ({
    chartsUrlWithPrefix: ({ url, framework }: { url: string; framework?: string }) =>
        `https://www.ag-grid.com/charts/${framework}/${url.slice('./'.length)}`,
}));

describe('resolveSharedUrl', () => {
    test.each`
        url                           | framework    | expected
        ${'grid:./mcp-server/'}       | ${'react'}   | ${'https://www.ag-grid.com/react-data-grid/mcp-server/'}
        ${'grid:./filter-text/'}      | ${'angular'} | ${'https://www.ag-grid.com/angular-data-grid/filter-text/'}
        ${'grid:./page/#section'}     | ${'react'}   | ${'https://www.ag-grid.com/react-data-grid/page/#section'}
        ${'charts:./bar-series/'}     | ${'react'}   | ${'https://www.ag-grid.com/charts/react/bar-series/'}
        ${'charts:./overview/'}       | ${'vue3'}    | ${'https://www.ag-grid.com/charts/vue3/overview/'}
        ${'./local-page/'}            | ${'react'}   | ${'./local-page/'}
        ${'https://www.ag-grid.com/'} | ${'react'}   | ${'https://www.ag-grid.com/'}
    `('$url (framework=$framework) -> $expected', ({ url, framework, expected }) => {
        expect(resolveSharedUrl({ url, framework })).toBe(expected);
    });
});
