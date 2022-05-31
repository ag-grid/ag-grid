import { standardiseWhitespace } from './test-utils';
import { wrapOptionsUpdateCode } from './chart-utils';

describe('wrapOptionsUpdateCode', () => {
    it('adds default options update code', () => {
        const functionDefinition = `function foo(bar) {
            options.padding.top = 20;
        }`;

        const propertyDefinition = wrapOptionsUpdateCode(functionDefinition);
        const expected = 'function foo(bar) { const options = {...this.options}; options.padding.top = 20; this.options = options; }';

        expect(standardiseWhitespace(propertyDefinition)).toBe(expected);
    });

    it('can customise options update code', () => {
        const functionDefinition = `foo = (bar) => {
            options.padding.top = 20;
        }`;

        const propertyDefinition = wrapOptionsUpdateCode(
            functionDefinition,
            'const options = cloneDeep(this.state.options);',
            'this.setState({ options });');

        const expected = 'foo = (bar) => { const options = cloneDeep(this.state.options); options.padding.top = 20; this.setState({ options }); }';

        expect(standardiseWhitespace(propertyDefinition)).toBe(expected);
    });

    it('correctly interprets braces inside the function body', () => {
        const functionDefinition = `foo(bar) {
            options.axes[0].gridStyle = [{ lineDash: [1, 3] }];
        }`;

        const propertyDefinition = wrapOptionsUpdateCode(functionDefinition);
        const expected = 'foo(bar) { const options = {...this.options}; options.axes[0].gridStyle = [{ lineDash: [1, 3] }]; this.options = options; }';

        expect(standardiseWhitespace(propertyDefinition)).toBe(expected);
    });
});
