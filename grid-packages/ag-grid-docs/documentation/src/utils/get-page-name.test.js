import { getPageName } from './get-page-name';

describe('getPageName', () => {
    it('returns page name for grid page', () => {
        expect(getPageName('/react-table/filter-set/')).toBe('filter-set');
    });

    it('returns page name for chart page', () => {
        expect(getPageName('/angular-charts/api-explorer/')).toBe('charts-api-explorer');
    });

    it('returns undefined for root page', () => {
        expect(getPageName('/')).toBeUndefined();
    });
});