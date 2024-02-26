import { getEntryFile } from './helpers';

describe('getEntryFile', () => {
    it.each([
        ['javascript', 'main.js'],
        ['angular', 'app.component.ts'],
        ['react', 'index.jsx'],
        ['vue', 'main.js'],
    ])
        ('returns entry file for %s', (framework, expected) => {
            expect(getEntryFile(framework)).toBe(expected);
        });
});