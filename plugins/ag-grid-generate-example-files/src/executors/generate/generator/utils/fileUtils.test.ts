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
        ${'vue'}               | ${'main.js'}
        ${'vue3'}              | ${'main.js'}
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
        ${'vue'}               | ${'main.js'}
        ${'vue3'}              | ${'main.js'}
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
        ${'typescript'}        | ${'charts-typescript-boilerplate'}
        ${'reactFunctional'}   | ${'charts-react-boilerplate'}
        ${'reactFunctionalTs'} | ${'charts-react-ts-boilerplate'}
        ${'angular'}           | ${'charts-angular-boilerplate'}
        ${'vue'}               | ${'charts-vue-boilerplate'}
        ${'vue3'}              | ${'charts-vue3-boilerplate'}
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
        ${'reactFunctional'}   | ${'.js'}
        ${'reactFunctionalTs'} | ${'.tsx'}
        ${'angular'}           | ${undefined}
        ${'vue'}               | ${'.js'}
        ${'vue3'}              | ${'.js'}
    `('$internalFramework is $expected', ({ internalFramework, expected }) => {
        expect(getTransformTsFileExt(internalFramework)).toEqual(expected);
    });
});
