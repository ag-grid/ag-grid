import { stripCssComments } from './getStyleFiles';

describe('stripCssComments', () => {
    test('removes a leading block comment and the comment lines inside a rule', () => {
        const css = ['/*', ' * Header', ' */', '', '.a {', '    /* note */', '    color: red;', '}', ''].join('\n');

        expect(stripCssComments(css)).toBe(['.a {', '    color: red;', '}', ''].join('\n'));
    });

    test('removes a comment between rules without leaving extra blank lines', () => {
        const css = ['.a {', '}', '', '/* Multi', '   line. */', '.b {', '}', ''].join('\n');

        expect(stripCssComments(css)).toBe(['.a {', '}', '', '.b {', '}', ''].join('\n'));
    });

    test('removes a trailing comment and keeps the declaration', () => {
        expect(stripCssComments('.a {\n    gap: 8px; /* why */\n}\n')).toBe('.a {\n    gap: 8px;\n}\n');
    });

    test('leaves data URIs containing slashes untouched', () => {
        const css =
            '.a {\n    --icon: url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>\');\n}\n';

        expect(stripCssComments(css)).toBe(css);
    });
});
