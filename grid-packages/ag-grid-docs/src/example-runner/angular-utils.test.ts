import { toInput, toConst, toOutput, toMember, toAssignment, convertTemplate, toTitleCase, getImport } from './angular-utils';

describe('toInput', () => {
    it('returns input definition', () => {
        const property = { name: 'foo' };
        const inputDefinition = toInput(property);

        expect(inputDefinition).toBe('[foo]="foo"');
    });
});

describe('toConst', () => {
    it('returns const definition', () => {
        const property = { name: 'foo', value: 'bar' };
        const constDefinition = toConst(property);

        expect(constDefinition).toBe('[foo]="bar"');
    });
});

describe('toOutput', () => {
    it('returns output definition', () => {
        const event = { name: 'foo', handlerName: 'fooHandler' };
        const outputDefinition = toOutput(event);

        expect(outputDefinition).toBe('(foo)="fooHandler($event)"');
    });
});

describe('toMember', () => {
    it('returns member definition', () => {
        const event = { name: 'foo' };
        const memberDefinition = toMember(event);

        expect(memberDefinition).toBe('private foo;');
    });
});

describe('toAssignment', () => {
    it('returns assignment definition', () => {
        const event = { name: 'foo', value: 123 };
        const assignmentDefinition = toAssignment(event);

        expect(assignmentDefinition).toBe('this.foo = 123');
    });
});

describe('convertTemplate', () => {
    it('converts event listeners', () => {
        const template = '<button onclick="foo()">Hello!</button>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<button (click)="foo()">Hello!</button>');
    });

    it('converts event parameters', () => {
        const template = '<button ondragover="foo(event)">Hello!</button>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<button (dragover)="foo($event)">Hello!</button>');
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

describe('getImport', () => {
    it('returns import statement', () => {
        const filename = 'partial-match-filter.component.ts';
        const importStatement = getImport(filename);

        expect(importStatement).toBe("import { PartialMatchFilter } from './partial-match-filter.component';");
    });
});