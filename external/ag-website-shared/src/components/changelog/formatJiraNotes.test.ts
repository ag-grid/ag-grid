import { formatJiraNotes } from './formatJiraNotes';

describe('formatJiraNotes', () => {
    describe('inline code', () => {
        test.each`
            name                                             | notes                                                     | expected
            ${'converts Jira wiki code'}                     | ${'{{sectorSpacing}} is removed. Rename it to {{gap}}.'}  | ${'<code>sectorSpacing</code> is removed. Rename it to <code>gap</code>.'}
            ${'closes wiki code at the last brace of a run'} | ${'Set {{collideWith: { seriesArea: true }}} to keep it'} | ${'Set <code>collideWith: { seriesArea: true }</code> to keep it'}
            ${'converts backticks typed as text'}            | ${'defaults to `true` instead of `false`'}                | ${'defaults to <code>true</code> instead of <code>false</code>'}
            ${'never carries a backtick span across lines'}  | ${'set `a=1.\nUse `b` instead'}                           | ${'set `a=1.\nUse <code>b</code> instead'}
            ${'leaves a line with a stray backtick alone'}   | ${'in `items` in the callback`), now `MenuItem`'}         | ${'in `items` in the callback`), now `MenuItem`'}
            ${'leaves single braces alone'}                  | ${'import React, {forwardRef} from'}                      | ${'import React, {forwardRef} from'}
        `('$name', ({ notes, expected }) => {
            expect(formatJiraNotes(notes)).toBe(expected);
        });
    });

    describe('existing markup', () => {
        test.each`
            name                | notes
            ${'a pre block'}    | ${'<pre>\n<Comp value={{ a: 1 }} />\n * `not code`\n</pre>'}
            ${'a code element'} | ${'<code>{{value}}</code>'}
            ${'a link'}         | ${'<a href="https://example.com/`a`">https://example.com/`a`</a>'}
        `('leaves $name untouched', ({ notes }) => {
            expect(formatJiraNotes(notes)).toBe(notes);
        });
    });

    test('turns a fenced block into a pre block without formatting its contents', () => {
        expect(formatJiraNotes('Before\n\n```\n.ag-row {\n    height: 50px; /* `px` */\n}\n```\nAfter')).toBe(
            'Before\n\n<pre>.ag-row {\n    height: 50px; /* `px` */\n}</pre>\nAfter'
        );
    });

    describe('bullet lists', () => {
        test('converts Jira bullets, dropping the line breaks Jira puts between them', () => {
            expect(
                formatJiraNotes('* {{a}} is deprecated.<br/>\n* On a {{line}} crossline, {{inside-*}} is too.')
            ).toBe(
                '<ul><li><code>a</code> is deprecated.</li><li>On a <code>line</code> crossline, <code>inside-*</code> is too.</li></ul>'
            );
        });

        test('drops the line breaks either side of a list but keeps those between paragraphs', () => {
            expect(formatJiraNotes('Intro:<br/>\n* a<br/>\n* b\n\nAfter\nmore')).toBe(
                'Intro:<ul><li>a</li><li>b</li></ul>\nAfter\nmore'
            );
        });

        test('nests deeper bullets inside the item above them, closing every level at the end', () => {
            expect(formatJiraNotes('* a\n** a1\n** a2\n* b\n** b1')).toBe(
                '<ul><li>a<ul><li>a1</li><li>a2</li></ul></li><li>b<ul><li>b1</li></ul></li></ul>'
            );
        });

        test('converts bullets typed with Windows line endings', () => {
            expect(formatJiraNotes('Keys:\r\n* Press ENTER\r\n* Press Shift + ENTER')).toBe(
                'Keys:<ul><li>Press ENTER</li><li>Press Shift + ENTER</li></ul>'
            );
        });

        test.each`
            name                        | notes
            ${'emphasis at line start'} | ${'*underlying* values'}
            ${'a Markdown heading'}     | ${"# Column 'initial' Values"}
        `('leaves $name alone', ({ notes }) => {
            expect(formatJiraNotes(notes)).toBe(notes);
        });
    });
});
