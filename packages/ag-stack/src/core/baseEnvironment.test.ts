import { BaseEnvironment } from './baseEnvironment';

class Environment extends BaseEnvironment<any, any, any, any, any> {
    protected initVariables(): void {}
    protected getAdditionalCss(): Map<string, string[]> {
        return new Map();
    }
    protected postProcessThemeChange(): void {}
    protected getDefaultTheme(): any {
        return undefined;
    }
    protected themeError(): void {}
    protected shadowRootError(): void {}
    protected varError(): void {}
}

describe('BaseEnvironment instance tagging', () => {
    test.each([false, true])('claims only its nearest tagged ancestor (shadow root: %s)', (shadow) => {
        const outer = new Environment();
        const inner = new Environment();
        const outerRoot = document.createElement('div');
        const innerRoot = document.createElement('div');
        const outerChild = document.createElement('span');
        const innerChild = document.createElement('span');
        (shadow ? outerRoot.attachShadow({ mode: 'open' }) : outerRoot).append(outerChild, innerRoot);
        (shadow ? innerRoot.attachShadow({ mode: 'open' }) : innerRoot).append(innerChild);

        outer.setInstanceDomData(outerRoot);
        inner.setInstanceDomData(innerRoot);

        expect(outer.isElementInThisInstance(outerChild)).toBe(true);
        expect(outer.isElementInThisInstance(innerChild), 'element of a nested instance').toBe(false);
        expect(inner.isElementInThisInstance(innerChild)).toBe(true);
        expect(outer.isElementInThisInstance(document.createElement('div')), 'untagged element').toBe(false);
    });
});
