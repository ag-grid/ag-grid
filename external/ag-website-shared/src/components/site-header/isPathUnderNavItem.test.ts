import { isPathUnderNavItem } from '@ag-website-shared/components/site-header/isPathUnderNavItem';

describe('isPathUnderNavItem', () => {
    // Page paths are directory indexes and so carry a trailing slash, while a nav path is authored
    // either way. Both forms have to match the same pages.
    test.each`
        path                                   | navPath                           | expected
        ${'/charts/javascript/context/'}       | ${'/charts/javascript/context'}   | ${true}
        ${'/charts/javascript/context/'}       | ${'/charts/javascript/context/'}  | ${true}
        ${'/charts/options'}                   | ${'/charts/options'}              | ${true}
        ${'/charts/javascript/tooltips/'}      | ${'/charts/javascript'}           | ${true}
        ${'/charts/gallery/'}                  | ${'/charts/javascript'}           | ${false}
        ${'/charts/javascript/context-menu/'}  | ${'/charts/javascript/context'}   | ${false}
        ${'/charts/javascript/api-state-e2e/'} | ${'/charts/javascript/api-state'} | ${false}
    `('is $expected for $path under $navPath', ({ path, navPath, expected }) => {
        expect(isPathUnderNavItem(path, navPath)).toBe(expected);
    });
});
