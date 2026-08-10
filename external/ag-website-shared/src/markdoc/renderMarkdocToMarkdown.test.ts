import { describe, expect, it, vi } from 'vitest';

import {
    type MarkdownResolvers,
    type RenderMarkdocToMarkdownOptions,
    fencedCodeBlock,
    renderMarkdocToMarkdown,
} from './renderMarkdocToMarkdown';

const markdocConfig = {
    variables: { agGridVersion: '33.1.0' },
    functions: {
        isFramework: {
            transform: (params: Record<string, unknown>, ctx: { variables: Record<string, unknown> }) =>
                Object.values(params).includes(ctx.variables?.framework),
        },
        isNotJavascriptFramework: {
            transform: (_params: Record<string, unknown>, ctx: { variables: Record<string, unknown> }) =>
                ctx.variables?.framework !== 'javascript',
        },
        gridVersion: {
            transform: (_params: Record<string, unknown>, ctx: { variables: Record<string, unknown> }) =>
                ctx.variables?.agGridVersion,
        },
        getFrameworkCapitalised: {
            transform: (_params: Record<string, unknown>, ctx: { variables: Record<string, unknown> }) => {
                const framework = ctx.variables?.framework as string | undefined;
                return framework ? framework[0].toUpperCase() + framework.slice(1) : '';
            },
        },
    },
};

function render(body: string, overrides: Partial<RenderMarkdocToMarkdownOptions> = {}): Promise<string> {
    return renderMarkdocToMarkdown({
        body,
        framework: 'react',
        pageName: 'test-page',
        markdocConfig,
        ...overrides,
    });
}

describe('renderMarkdocToMarkdown', () => {
    it('emits YAML frontmatter with title, framework and version, then the H1 (description omitted)', async () => {
        const output = await render('Body paragraph.', {
            framework: 'angular',
            version: '33.1.0',
            frontmatter: { title: 'Cell Editing', description: 'How to edit cells.' },
        });

        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "Cell Editing"');
        expect(output).toContain('framework: angular');
        expect(output).toContain('version: "33.1.0"');
        expect(output).toContain('\n# Cell Editing\n');
        expect(output).toContain('Body paragraph.');
        // The description is deliberately not repeated in the body.
        expect(output).not.toContain('How to edit cells.');
    });

    it('flags an Enterprise-only page in the frontmatter', async () => {
        const output = await render('Body paragraph.', {
            frontmatter: { title: 'Context Menu', enterprise: true },
        });

        expect(output).toContain('enterprise: true');
    });

    it('omits the Enterprise flag for a Community page', async () => {
        const output = await render('Body paragraph.', { frontmatter: { title: 'Bar Series' } });

        expect(output).not.toContain('enterprise:');
    });

    it('passes through standard markdown (headings, emphasis, links, lists, tables)', async () => {
        const body = [
            '## Heading Two',
            '',
            'Text with **bold**, *em* and `code`.',
            '',
            '- one',
            '- two',
            '  - nested',
            '',
            '1. first',
            '2. second',
            '',
            '| A | B |',
            '|---|--:|',
            '| a | b |',
        ].join('\n');

        const output = await render(body);

        expect(output).toContain('## Heading Two');
        expect(output).toContain('Text with **bold**, *em* and `code`.');
        expect(output).toContain('- one\n- two\n  - nested');
        expect(output).toContain('1. first\n2. second');
        expect(output).toContain('| A | B |\n| --- | ---: |\n| a | b |');
    });

    it('resolves isFramework conditionals for the target framework', async () => {
        const body = '{% if isFramework("react") %}REACT_ONLY{% else /%}OTHER{% /if %}';

        expect(await render(body, { framework: 'react' })).toContain('REACT_ONLY');
        expect(await render(body, { framework: 'react' })).not.toContain('OTHER');
        expect(await render(body, { framework: 'angular' })).toContain('OTHER');
        expect(await render(body, { framework: 'angular' })).not.toContain('REACT_ONLY');
    });

    it('resolves isNotJavascriptFramework and nested conditionals', async () => {
        const body = [
            '{% if isNotJavascriptFramework() %}',
            'FRAMEWORK',
            '{% if isFramework("vue") %}VUE_INNER{% /if %}',
            '{% else /%}',
            'PLAIN_JS',
            '{% /if %}',
        ].join('\n');

        const vue = await render(body, { framework: 'vue' });
        expect(vue).toContain('FRAMEWORK');
        expect(vue).toContain('VUE_INNER');
        expect(vue).not.toContain('PLAIN_JS');

        const js = await render(body, { framework: 'javascript' });
        expect(js).toContain('PLAIN_JS');
        expect(js).not.toContain('FRAMEWORK');
        expect(js).not.toContain('VUE_INNER');
    });

    it('resolves variable and function interpolation', async () => {
        const body = 'Version {% $agGridVersion %} / {% gridVersion() %} / {% getFrameworkCapitalised() %}.';
        expect(await render(body, { framework: 'react' })).toContain('Version 33.1.0 / 33.1.0 / React.');
    });

    it('renders note/warning/idea callouts as blockquotes with a bold label', async () => {
        const output = await render('{% note %}\nBe careful here.\n{% /note %}');
        expect(output).toContain('> **Note**');
        expect(output).toContain('> Be careful here.');
    });

    it('renders tab items as sequential sections in order', async () => {
        const body = [
            '{% tabs %}',
            '{% tabItem id="a" label="First" %}',
            'First body.',
            '{% /tabItem %}',
            '{% tabItem id="b" label="Second" %}',
            'Second body.',
            '{% /tabItem %}',
            '{% /tabs %}',
        ].join('\n');

        const output = await render(body);
        expect(output.indexOf('#### First')).toBeLessThan(output.indexOf('#### Second'));
        expect(output).toContain('First body.');
        expect(output).toContain('Second body.');
    });

    it('invokes transformFence for frameworkTransform fences and passes plain fences through', async () => {
        const transformFence = vi.fn(({ code, framework }: { code: string; framework: string }) => ({
            code: `/* ${framework} */\n${code}`,
            language: 'jsx',
        }));
        const resolvers: MarkdownResolvers = { transformFence };

        const body = [
            '```{% frameworkTransform=true language="ts" %}',
            'const gridOptions = {};',
            '```',
            '',
            '```js',
            'const plain = 1;',
            '```',
        ].join('\n');

        const output = await render(body, { resolvers });

        expect(transformFence).toHaveBeenCalledTimes(1);
        expect(transformFence).toHaveBeenCalledWith(expect.objectContaining({ framework: 'react', language: 'ts' }));
        expect(output).toContain('```jsx\n/* react */\nconst gridOptions = {};\n```');
        expect(output).toContain('```js\nconst plain = 1;\n```');
    });

    it('embeds example source and a live-example link', async () => {
        const resolvers: MarkdownResolvers = {
            loadExampleSource: async ({ name, framework }) => ({
                code: `// ${framework} ${name}`,
                language: 'jsx',
                liveUrl: `https://example.test/${name}/${framework}`,
            }),
        };
        const output = await render('{% gridExampleRunner title="Basic" name="basic-grid" /%}', { resolvers });

        expect(output).toContain('#### Basic');
        expect(output).toContain('```jsx\n// react basic-grid\n```');
        expect(output).toContain('[Live example: Basic](https://example.test/basic-grid/react)');
    });

    it('delegates apiDocumentation/interfaceDocumentation to renderApiTable', async () => {
        const renderApiTable = vi.fn(({ kind }: { kind: string }) => `TABLE_FOR_${kind}`);
        const resolvers: MarkdownResolvers = { renderApiTable };

        const output = await render(
            [
                '{% apiDocumentation source="grid-options/properties" names=["editable"] /%}',
                '',
                '{% interfaceDocumentation interfaceName="ICellRendererParams" /%}',
            ].join('\n'),
            { resolvers }
        );

        expect(output).toContain('TABLE_FOR_api');
        expect(output).toContain('TABLE_FOR_interface');
        expect(renderApiTable).toHaveBeenCalledTimes(2);
    });

    it('resolves variable/function attributes before handing off to renderApiTable', async () => {
        const renderApiTable = vi.fn(() => 'TABLE');
        await render('{% apiDocumentation source=$apiSource /%}', {
            resolvers: { renderApiTable },
            markdocConfig: {
                ...markdocConfig,
                variables: { ...markdocConfig.variables, apiSource: 'grid-options/properties' },
            },
        });

        // The `$apiSource` variable must arrive resolved to its value, not as a Markdoc AST node.
        expect(renderApiTable).toHaveBeenCalledWith(
            expect.objectContaining({ attributes: { source: 'grid-options/properties' } })
        );
    });

    it('delegates unhandled tags to renderTag and embeds the resolved result', async () => {
        const renderTag = vi.fn(
            ({ tag, attributes }: { tag: string; attributes: Record<string, unknown> }) =>
                `RENDERED:${tag}:${attributes.name ?? ''}`
        );
        const output = await render('{% matrixTable dataFileName="row-models" name="x" /%}', {
            resolvers: { renderTag },
        });

        expect(renderTag).toHaveBeenCalledWith(
            expect.objectContaining({ tag: 'matrixTable', framework: 'react', pageName: 'test-page' })
        );
        expect(renderTag).toHaveBeenCalledWith(
            expect.objectContaining({ attributes: expect.objectContaining({ dataFileName: 'row-models', name: 'x' }) })
        );
        expect(output).toContain('RENDERED:matrixTable:x');
    });

    it('falls back to rendering children when renderTag returns null', async () => {
        const renderTag = vi.fn(() => null);
        const output = await render('{% customWrapper %}\nInner **content**.\n{% /customWrapper %}', {
            resolvers: { renderTag },
        });

        expect(renderTag).toHaveBeenCalledWith(expect.objectContaining({ tag: 'customWrapper' }));
        expect(output).toContain('Inner **content**.');
    });

    it('delegates gettingStarted/licenseSetup/trialLicenceForm to renderTag', async () => {
        const renderTag = vi.fn(({ tag }: { tag: string }) => `RENDERED:${tag}`);
        const body = [
            '{% gettingStarted library="grid" /%}',
            '',
            '{% licenseSetup /%}',
            '',
            '{% trialLicenceForm /%}',
        ].join('\n');
        const output = await render(body, { resolvers: { renderTag } });

        for (const tag of ['gettingStarted', 'licenseSetup', 'trialLicenceForm']) {
            expect(renderTag).toHaveBeenCalledWith(expect.objectContaining({ tag }));
            expect(output).toContain(`RENDERED:${tag}`);
        }
    });

    it('preserves indentation for conditional content inside a list item', async () => {
        const body = ['- item', '', '  {% if isFramework("react") %}', '  nested react line', '  {% /if %}'].join('\n');
        const output = await render(body, { framework: 'react' });
        expect(output).toContain('nested react line');
    });

    it('resolves partials via the readPartial resolver', async () => {
        const resolvers: MarkdownResolvers = {
            readPartial: ({ file }) => (file === '_partial.mdoc' ? 'Partial **content**.' : null),
        };
        const output = await render('{% partial file="_partial.mdoc" /%}', { resolvers });
        expect(output).toContain('Partial **content**.');
    });

    it('resolves image tags inside a partial through resolveImageSrc', async () => {
        const resolvers: MarkdownResolvers = {
            readPartial: ({ file }) =>
                file === '_diagram.mdoc' ? '{% image imagePath="resources/diagram.svg" alt="Diagram" /%}' : null,
            resolveImageSrc: async ({ imagePath, pageName }) => `https://example.test/${pageName}/${imagePath}?hashed`,
        };
        const output = await render('{% partial file="_diagram.mdoc" /%}', {
            resolvers,
            pageName: 'supported-browsers',
        });
        expect(output).toContain('![Diagram](https://example.test/supported-browsers/resources/diagram.svg?hashed)');
    });

    it('preserves blank lines inside fenced code (normalisation is fence-aware)', async () => {
        const body = ['```js', 'const a = 1;', '', '', 'const b = 2;', '```'].join('\n');
        const output = await render(body);
        expect(output).toContain('```js\nconst a = 1;\n\n\nconst b = 2;\n```');
    });

    it('treats a shorter inner fence as code, not a delimiter, when normalising blank lines', async () => {
        // A doc example whose source contains a ``` fence is wrapped in a 4-backtick fence; the inner
        // ``` must not flip the fence state, or blank lines after it get collapsed as if they were prose.
        const body = ['````md', '```js', 'const a = 1;', '', '', 'const b = 2;', '```', '````'].join('\n');
        const output = await render(body);
        expect(output).toContain('const a = 1;\n\n\nconst b = 2;');
    });

    it('lengthens the inline-code delimiter so a span containing a backtick stays valid', async () => {
        const output = await render('Use `` `foo` `` in config.');
        expect(output).toContain('`` `foo` ``');
    });

    it('resolves framework conditionals inside a code fence', async () => {
        const body = [
            '```js',
            'const a = 1;',
            '{% if isFramework("react") %}',
            'const framework = "react";',
            '{% /if %}',
            '{% if isFramework("angular") %}',
            'const framework = "angular";',
            '{% /if %}',
            '```',
        ].join('\n');

        const react = await render(body, { framework: 'react' });
        expect(react).toContain('const framework = "react";');
        expect(react).not.toContain('const framework = "angular";');
        expect(react).not.toContain('{% if');

        const angular = await render(body, { framework: 'angular' });
        expect(angular).toContain('const framework = "angular";');
        expect(angular).not.toContain('const framework = "react";');
    });

    it('renders numberHeading with its heading and inner content', async () => {
        const body = [
            '{% numberHeading number="1" title="Install" level="h3" %}',
            'Run the install:',
            '',
            '```bash',
            'npm install ag-grid-community',
            '```',
            '{% /numberHeading %}',
        ].join('\n');
        const output = await render(body);

        expect(output).toContain('### 1. Install');
        expect(output).toContain('Run the install:');
        expect(output).toContain('npm install ag-grid-community');
    });

    it('renders expandingSection as a bold label, not a heading', async () => {
        const body = [
            '{% expandingSection headerText="Advanced options" %}',
            'Hidden detail.',
            '{% /expandingSection %}',
        ].join('\n');
        const output = await render(body);

        expect(output).toContain('**Advanced options:**');
        expect(output).not.toContain('#### Advanced options');
        expect(output).toContain('Hidden detail.');
    });

    describe('fencedCodeBlock', () => {
        it('uses a 3-backtick fence for code with no backticks', () => {
            expect(fencedCodeBlock('const a = 1;', 'js')).toBe('```js\nconst a = 1;\n```');
        });

        it('lengthens the fence to outlast the longest backtick run in the code', () => {
            // Code containing a ``` run needs a 4-backtick fence, or the block terminates early.
            const code = 'Here:\n```js\nconst a = 1;\n```\nEnd.';
            const output = fencedCodeBlock(code, 'md');
            expect(output).toBe(`\`\`\`\`md\n${code}\n\`\`\`\``);
        });

        it('handles an empty language', () => {
            expect(fencedCodeBlock('plain', '')).toBe('```\nplain\n```');
        });
    });

    it('strips HTML comments from prose but keeps them inside code fences', async () => {
        const body = [
            'Before.',
            '',
            '<!-- authoring marker -->',
            '',
            'Text with <!-- inline --> comment.',
            '',
            '```html',
            '<!-- real html example -->',
            '```',
        ].join('\n');
        const output = await render(body);

        expect(output).toContain('Before.');
        expect(output).not.toContain('authoring marker');
        expect(output).not.toContain('inline');
        // A comment inside a code fence is legitimate content and is preserved.
        expect(output).toContain('<!-- real html example -->');
    });

    it('strips multi-line HTML comments split across text nodes', async () => {
        const body = [
            'Before.',
            '',
            '<!--',
            'authoring note line one',
            'authoring note line two',
            '-->',
            '',
            'After.',
        ].join('\n');
        const output = await render(body);

        expect(output).toContain('Before.');
        expect(output).toContain('After.');
        expect(output).not.toContain('authoring note');
        expect(output).not.toContain('<!--');
        expect(output).not.toContain('-->');
    });

    it('strips a block comment containing blank lines and nested tags, without executing them', async () => {
        const body = [
            'Before.',
            '',
            '<!-- The full list for version {% gridVersion() %}.',
            '',
            '{% expandingSection headerText="Breaking Changes" %}',
            'placeholder item',
            '{% /expandingSection %}',
            '-->',
            '',
            'After.',
        ].join('\n');
        const output = await render(body);

        expect(output).toContain('Before.');
        expect(output).toContain('After.');
        expect(output).not.toContain('<!--');
        expect(output).not.toContain('-->');
        expect(output).not.toContain('The full list');
        // The nested tag must not render, and the resolved version must not leak.
        expect(output).not.toContain('Breaking Changes');
        expect(output).not.toContain('placeholder item');
        expect(output).not.toContain('33.1');
    });

    it('resolves image tags (including inline in tables) via the async resolveImageSrc resolver', async () => {
        const resolvers: MarkdownResolvers = {
            resolveImageSrc: async ({ imagePath, pageName }) => `https://example.test/${pageName}/${imagePath}?hashed`,
        };
        const body = [
            '{% image imagePath="resources/diagram.svg" alt="Diagram" /%}',
            '',
            '| Browser | Notes |',
            '| --- | --- |',
            '| {% image imagePath="resources/chrome.svg" alt="Chrome" width="24px" /%} Chrome | Latest. |',
        ].join('\n');

        const output = await render(body, { resolvers, pageName: 'supported-browsers' });

        expect(output).toContain('![Diagram](https://example.test/supported-browsers/resources/diagram.svg?hashed)');
        // Inline image inside a table cell is resolved too (sync render reads the prefetched src).
        expect(output).toContain('![Chrome](https://example.test/supported-browsers/resources/chrome.svg?hashed)');
    });

    it('renders a videoSection as its header prose followed by a link to the video', async () => {
        const body = [
            '{% videoSection id="98JVaTcoexc" title="Custom Filter Components" showHeader=true %}',
            'Filter components let you add your own filter types.',
            '{% /videoSection %}',
        ].join('\n');

        const output = await render(body);

        expect(output).toContain('Filter components let you add your own filter types.');
        expect(output).toContain('[Custom Filter Components](https://www.youtube.com/watch?v=98JVaTcoexc)');
    });

    it('normalises output to a single trailing newline and no triple newlines', async () => {
        const output = await render('# A\n\n\n\nParagraph.\n\n\n');
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
        expect(output).not.toMatch(/\n{3,}/);
    });
});
