import type { CapturedDiagnostic } from '../logging';
import {
    diagnosticContentToMarkdown,
    diagnosticToMarkdown,
    parseDiagnosticText,
    renderDiagnostic,
    renderDiagnosticElement,
} from './errorOverlayRenderer';

describe('parseDiagnosticText', () => {
    test('returns plain prose untouched when there is no snippet', () => {
        const content = parseDiagnosticText('rowSelection must be an object.');
        expect(content).toEqual({ message: 'rowSelection must be an object.', code: undefined, note: undefined });
    });

    test('strips trailing "See <link>" documentation references', () => {
        const content = parseDiagnosticText('Something went wrong. See https://ag-grid.com/errors/42?_version_=x');
        expect(content.message).toBe('Something went wrong.');
    });

    test('splits a module-registration snippet from the surrounding prose and note', () => {
        const raw = [
            'No module registered for X.',
            "import { ModuleRegistry } from 'ag-grid-community';",
            'ModuleRegistry.registerModules([ RowGroupingModule ]);',
            'The feature will not work.',
        ].join('\n');

        const content = parseDiagnosticText(raw);

        expect(content.message).toBe('No module registered for X.');
        expect(content.code).toContain("import { ModuleRegistry } from 'ag-grid-community';");
        expect(content.code).toContain('ModuleRegistry.registerModules([ RowGroupingModule ]);');
        expect(content.note).toBe('The feature will not work.');
    });

    test('extracts the "For more info see:" documentation link and removes it from the prose', () => {
        const raw = 'Register the module. For more info see: https://ag-grid.com/javascript-data-grid/modules';
        const content = parseDiagnosticText(raw);
        expect(content.docLink).toBe('https://ag-grid.com/javascript-data-grid/modules');
        expect(content.message).not.toContain('For more info see');
    });
});

describe('renderDiagnosticElement', () => {
    test('renders the severity class, error-code link and documentation link', () => {
        const el = renderDiagnosticElement(
            'warning',
            { message: 'something', docLink: 'https://ag-grid.com/grid-options' },
            'https://ag-grid.com/errors/22',
            'AG Grid #22'
        );
        expect(el.classList.contains('ag-overlay-error-item')).toBe(true);
        expect(el.classList.contains('ag-overlay-error-item-warning')).toBe(true);

        const links = el.querySelectorAll<HTMLAnchorElement>('a.ag-overlay-error-link');
        expect(links).toHaveLength(2);
        expect(links[0].href).toContain('/errors/22');
        expect(links[0].textContent).toBe('AG Grid #22');
        expect(links[1].textContent).toBe('Documentation');
    });

    test('renders backtick-delimited spans as inline code', () => {
        const el = renderDiagnosticElement('error', { message: 'Use `foo` here.' }, 'https://x/errors/1', '#1');
        const code = el.querySelector('code.ag-overlay-error-inline-code');
        expect(code).not.toBeNull();
        expect(code!.textContent).toBe('foo');
    });

    test('renders a nested-source label when supplied, and omits it otherwise', () => {
        const withSource = renderDiagnosticElement('warning', { message: 'm' }, 'https://x/e/1', '#1', 'From a grid');
        expect(withSource.querySelector('.ag-overlay-error-nested-source')?.textContent).toBe('From a grid');

        const withoutSource = renderDiagnosticElement('warning', { message: 'm' }, 'https://x/e/1', '#1');
        expect(withoutSource.querySelector('.ag-overlay-error-nested-source')).toBeNull();
    });

    test('renderDiagnostic labels a nested diagnostic', () => {
        const el = renderDiagnostic({ id: 307, params: {}, severity: 'warning', gridId: '2' }, true);
        expect(el.querySelector('.ag-overlay-error-nested-source')?.textContent).toBe('Reported by a nested grid');
    });

    test('renders a code snippet block when present', () => {
        const el = renderDiagnosticElement(
            'error',
            { message: 'm', code: 'ModuleRegistry.registerModules([ X ]);' },
            'https://x/errors/200',
            '#200'
        );
        const pre = el.querySelector('pre.ag-overlay-error-code');
        expect(pre).not.toBeNull();
        expect(pre!.textContent).toContain('ModuleRegistry.registerModules([ X ]);');
    });

    test('omits the module-docs link when absent', () => {
        const el = renderDiagnosticElement('deprecation', { message: 'm' }, 'https://x/errors/9', '#9');
        expect(el.querySelectorAll('a.ag-overlay-error-link')).toHaveLength(1);
    });

    test('renders a URL embedded in prose as a clickable link', () => {
        const el = renderDiagnosticElement(
            'warning',
            { message: 'Please check: https://ag-grid.com/grid-options/' },
            'https://x/errors/310',
            '#310'
        );
        const link = el.querySelector<HTMLAnchorElement>('.ag-overlay-error-message a');
        expect(link).not.toBeNull();
        expect(link!.getAttribute('href')).toBe('https://ag-grid.com/grid-options/');
    });

    test('keeps trailing sentence punctuation out of a linkified URL', () => {
        const el = renderDiagnosticElement('warning', { message: 'see https://ag-grid.com/x.' }, 'https://x/e/1', '#1');
        const message = el.querySelector('.ag-overlay-error-message')!;
        expect(message.querySelector('a')!.getAttribute('href')).toBe('https://ag-grid.com/x');
        expect(message.textContent).toBe('See https://ag-grid.com/x.');
    });
});

describe('diagnosticContentToMarkdown', () => {
    test('renders the heading, prose with inline code preserved, and both links', () => {
        const md = diagnosticContentToMarkdown(
            'warning',
            307,
            {
                message: 'Invalid `gridOptions` property `notAValidGridOption`.',
                note: 'Use the `gridOptions.context` property instead.',
                docLink: 'https://ag-grid.com/grid-options/',
            },
            'https://ag-grid.com/errors/307'
        );
        expect(md).toMatchInlineSnapshot(`
          "### [Warning] AG Grid #307
          Invalid \`gridOptions\` property \`notAValidGridOption\`.
          Use the \`gridOptions.context\` property instead.
          Documentation: https://ag-grid.com/grid-options/
          More info: https://ag-grid.com/errors/307"
        `);
    });

    test('renders a fenced code block when a code snippet is present', () => {
        const md = diagnosticContentToMarkdown(
            'error',
            200,
            { message: 'No module.', code: 'ModuleRegistry.registerModules([ X ]);' },
            'https://ag-grid.com/errors/200'
        );
        expect(md).toMatchInlineSnapshot(`
          "### [Error] AG Grid #200
          No module.
          \`\`\`
          ModuleRegistry.registerModules([ X ]);
          \`\`\`
          More info: https://ag-grid.com/errors/200"
        `);
    });
});

describe('against real error definitions', () => {
    const diagnostic: CapturedDiagnostic = { id: 22, params: { key: 'rowData' }, severity: 'warning' };

    test('renderDiagnostic links to the error code', () => {
        const el = renderDiagnostic(diagnostic);
        const link = el.querySelector<HTMLAnchorElement>('a.ag-overlay-error-link');
        expect(link!.href).toContain('/errors/22');
        expect(el.querySelector('.ag-overlay-error-message')?.textContent?.length).toBeGreaterThan(0);
    });

    test('diagnosticToMarkdown produces a docs link for the id', () => {
        const md = diagnosticToMarkdown(diagnostic);
        expect(md).toContain('### [Warning] AG Grid #22');
        expect(md).toContain('/errors/22');
    });

    test('capitalises the first letter when the message starts with prose', () => {
        const el = renderDiagnosticElement('warning', { message: 'to see all properties' }, 'https://x/e/1', '#1');
        expect(el.querySelector('.ag-overlay-error-message')!.textContent).toMatch(/^To see/);
    });

    test('does not capitalise a leading code identifier', () => {
        const el = renderDiagnosticElement('error', { message: '`rowData` must be an array' }, 'https://x/e/1', '#1');
        expect(el.querySelector('code.ag-overlay-error-inline-code')!.textContent).toBe('rowData');
    });

    test('renders an embedded object value (array-returning message) as inline code', () => {
        const el = renderDiagnostic({ id: 5, params: { data: { make: 'Tesla' } }, severity: 'warning' });
        const codes = Array.from(el.querySelectorAll('code.ag-overlay-error-inline-code')).map((c) => c.textContent);
        expect(codes).toContain('{"make":"Tesla"}');
    });
});
