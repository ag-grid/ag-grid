import { getPageName } from './get-page-name';

describe('getPageName', () => {
    it('returns page name', () => {
        expect(getPageName('/documentation/react/filter-set/')).toBe('filter-set');
    });
});