import * as locales from './main';

describe.skip('translations', () => {
    const enKeys = Object.keys(locales.AG_GRID_LOCALE_EN);

    it.each(Object.keys(locales))('locale %s has all translations defined', (locale) => {
        expect(Object.keys((locales as any)[locale])).toEqual(enKeys);
    });
});
