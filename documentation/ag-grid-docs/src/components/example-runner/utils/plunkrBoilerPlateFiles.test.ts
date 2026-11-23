import { getPlunkrBoilerPlateFiles } from './plunkrBoilerPlateFiles';

describe('getPlunkrBoilerPlateFiles', () => {
    test('gives TypeScript examples a strict tsconfig holding only boolean compiler options', () => {
        const files = getPlunkrBoilerPlateFiles('reactFunctionalTs')!;
        const { compilerOptions } = JSON.parse(files['tsconfig.json']);

        expect(compilerOptions.strict).toBe(true);
        expect(Object.values(compilerOptions).every((value) => typeof value === 'boolean')).toBe(true);
    });

    test('adds no files for JavaScript examples', () => {
        expect(getPlunkrBoilerPlateFiles('reactFunctional')).toBeUndefined();
    });
});
