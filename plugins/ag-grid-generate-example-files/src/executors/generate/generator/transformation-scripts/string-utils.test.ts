import { toKebabCase, toTitleCase } from './string-utils';

describe('toKebabCase', () => {
    it('converts camel case to kebab case', () => {
        const name = 'myComponent';
        const kebabCase = toKebabCase(name);

        expect(kebabCase).toBe('my-component');
    });

    it('converts title case to kebab case', () => {
        const name = 'MyComponent';
        const kebabCase = toKebabCase(name);

        expect(kebabCase).toBe('my-component');
    });

    it('leaves kebab case untouched', () => {
        const name = 'my-component';
        const kebabCase = toKebabCase(name);

        expect(kebabCase).toBe(name);
    });
});

describe('toTitleCase', () => {
    it('converts kebab case to title case', () => {
        const titleCase = toTitleCase('my-component-name');

        expect(titleCase).toBe('MyComponentName');
    });

    it('does nothing when already title cased', () => {
        const name = 'MyComponentName';
        const titleCase = toTitleCase(name);

        expect(titleCase).toBe(name);
    });
});
