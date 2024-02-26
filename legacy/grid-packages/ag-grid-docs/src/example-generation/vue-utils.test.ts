import { toKebabCase, toInput, toConst, toOutput, toMember, toAssignment, getImport, convertTemplate } from './vue-utils';

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

describe('toInput', () => {
    it('returns input definition', () => {
        const property = { name: 'foo' };
        const inputDefinition = toInput(property);

        expect(inputDefinition).toBe(':foo="foo"');
    });
});

describe('toConst', () => {
    it('returns const definition', () => {
        const property = { name: 'foo', value: 'bar' };
        const constDefinition = toConst(property);

        expect(constDefinition).toBe(':foo="bar"');
    });
});

describe('toOutput', () => {
    it('returns output definition', () => {
        const event = { name: 'onClick', handlerName: 'onClickHandler' };
        const outputDefinition = toOutput(event);

        expect(outputDefinition).toBe('@on-click="onClickHandler"');
    });
});

describe('toMember', () => {
    it('returns member definition', () => {
        const event = { name: 'foo' };
        const memberDefinition = toMember(event);

        expect(memberDefinition).toBe('foo: null');
    });
});

describe('toAssignment', () => {
    it('returns assignment definition', () => {
        const event = { name: 'foo', value: '123' };
        const assignmentDefinition = toAssignment(event);

        expect(assignmentDefinition).toBe('this.foo = 123');
    });

    it('converts functions', () => {
        const event = { name: 'foo', value: 'function(bar) { return true; }' };
        const assignmentDefinition = toAssignment(event);

        expect(assignmentDefinition).toBe('this.foo = (bar) => { return true; }');
    });
});

describe('getImport', () => {
    it('returns import statement', () => {
        const filename = 'partialMatchFilterVue.js';
        const importStatement = getImport(filename, 'Vue', '');

        expect(importStatement).toBe("import PartialMatchFilter from './partialMatchFilterVue.js';");
    });
});

describe('convertTemplate', () => {
    it('converts event handlers', () => {
        const template = '<button onclick="foo(true)">Hello!</button>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<button v-on:click="foo(true)">Hello!</button>');
    });
});
