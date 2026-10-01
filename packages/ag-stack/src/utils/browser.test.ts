import { _isRealCssEngine } from './browser';

describe('_isRealCssEngine', () => {
    test('reports no CSS engine in unit tests', () => {
        expect(_isRealCssEngine()).toBe(false);
    });
});
