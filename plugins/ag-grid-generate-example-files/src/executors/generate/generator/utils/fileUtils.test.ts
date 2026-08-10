/**
 * @jest-environment node
 */
import { getBoilerPlateName, getEntryFileName, getMainFileName, getTransformTsFileExt } from './fileUtils';

describe('getEntryFileName', () => {
    test.each`
        internalFramework      | expected
        ${undefined}           | ${undefined}
        ${'other'}             | ${undefined}
        ${'vanilla'}           | ${'main.js'}
        ${'typescript'}        | ${'main.ts'}
        ${'reactFunctional'}   | ${'index.jsx'}
        ${'reactFunctionalTs'} | ${'index.tsx'}
        ${'angular'}           | ${'main.ts'}
        ${'vue3'}              | ${'main.ts'}
    `('$internalFramework is $expected', ({ internalFramework, expected }) => {
        expect(getEntryFileName(internalFramework)).toEqual(expected);
    });
});

describe('getMainFileName', () => {
    test.each`
        internalFramework      | expected
        ${undefined}           | ${undefined}
        ${'other'}             | ${undefined}
        ${'vanilla'}           | ${'main.js'}
        ${'typescript'}        | ${'main.ts'}
        ${'reactFunctional'}   | ${'index.jsx'}
        ${'reactFunctionalTs'} | ${'index.tsx'}
        ${'angular'}           | ${'app.component.ts'}
        ${'vue3'}              | ${'main.ts'}
    `('$internalFramework is $expected', ({ internalFramework, expected }) => {
        expect(getMainFileName(internalFramework)).toEqual(expected);
    });
});

describe('getBoilerPlateName', () => {
    test.each`
        internalFramework      | expected
        ${undefined}           | ${undefined}
        ${'other'}             | ${undefined}
        ${'vanilla'}           | ${undefined}
        ${'typescript'}        | ${undefined}
        ${'reactFunctional'}   | ${undefined}
        ${'reactFunctionalTs'} | ${undefined}
        ${'angular'}           | ${'grid-angular-boilerplate'}
        ${'vue3'}              | ${undefined}
    `('$internalFramework is $expected', ({ internalFramework, expected }) => {
        expect(getBoilerPlateName(internalFramework)).toEqual(expected);
    });
});

describe('getTransformTsFileExt', () => {
    test.each`
        internalFramework      | expected
        ${undefined}           | ${'.js'}
        ${'other'}             | ${'.js'}
        ${'vanilla'}           | ${'.js'}
        ${'typescript'}        | ${undefined}
        ${'reactFunctional'}   | ${'.jsx'}
        ${'reactFunctionalTs'} | ${'.tsx'}
        ${'angular'}           | ${undefined}
        ${'vue3'}              | ${undefined}
    `('$internalFramework is $expected', ({ internalFramework, expected }) => {
        expect(getTransformTsFileExt(internalFramework)).toEqual(expected);
    });
});
