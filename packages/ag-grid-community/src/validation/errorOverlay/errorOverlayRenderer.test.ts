import type { CapturedDiagnostic } from '../logging';
import {
    diagnosticContentToMarkdown,
    diagnosticToMarkdown,
    parseDiagnosticText,
    renderDiagnostic,
    renderDiagnosticElement,
    renderDiagnosticSections,
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

    test('renders the unattributed note only when flagged', () => {
        const plain = renderDiagnosticElement('error', { message: 'm' }, 'https://x/e/1', '#1');
        expect(plain.querySelector('.ag-overlay-error-unattributed')).toBeNull();

        const marked = renderDiagnosticElement('error', { message: 'm' }, 'https://x/e/1', '#1', true);
        const note = marked.querySelector('.ag-overlay-error-unattributed');
        expect(note).not.toBeNull();
        expect(note!.textContent).toBe('This error may not have originated from this grid');
    });
});

describe('unattributed marking', () => {
    const owned: CapturedDiagnostic = { id: 22, params: { key: 'rowData' }, severity: 'warning', gridId: '1' };
    const untied: CapturedDiagnostic = { id: 22, params: { key: 'rowData' }, severity: 'warning' };

    test('renderDiagnostic marks a diagnostic with no gridId when asked', () => {
        const el = renderDiagnostic(untied, { showsUnattributedOrigin: true });
        expect(el.querySelector('.ag-overlay-error-unattributed')).not.toBeNull();
    });

    test('renderDiagnostic leaves an attributed diagnostic unmarked even when asked', () => {
        const el = renderDiagnostic(owned, { showsUnattributedOrigin: true });
        expect(el.querySelector('.ag-overlay-error-unattributed')).toBeNull();
    });

    test('renderDiagnostic never marks when marking is off', () => {
        expect(renderDiagnostic(untied).querySelector('.ag-overlay-error-unattributed')).toBeNull();
    });

    test('renderDiagnosticSections marks only the untied items', () => {
        const nodes = renderDiagnosticSections([owned, untied], { showsUnattributedOrigin: true });
        const items = nodes.flatMap((node) => Array.from(node.querySelectorAll('.ag-overlay-error-item')));
        const marked = items.filter((item) => item.querySelector('.ag-overlay-error-unattributed'));
        expect(items).toHaveLength(2);
        expect(marked).toHaveLength(1);
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

describe('renderDiagnosticSections', () => {
    const error: CapturedDiagnostic = {
        id: 200,
        params: { moduleName: 'ClientSideRowModel', rowModelType: 'clientSide' },
        severity: 'error',
    };
    const warning: CapturedDiagnostic = { id: 22, params: { key: 'rowData' }, severity: 'warning' };
    const deprecation: CapturedDiagnostic = { id: 23, params: { key: 'rowData' }, severity: 'deprecation' };

    const sectionsOf = (nodes: HTMLElement[]): HTMLElement[] =>
        nodes.filter((node) => node.classList.contains('ag-overlay-error-section'));

    test('groups diagnostics into severity-ordered sections with pluralised counts', () => {
        const nodes = renderDiagnosticSections([warning, deprecation, error, warning]);
        const headers = sectionsOf(nodes).map((s) => s.querySelector('.ag-overlay-error-section-header')!.textContent);
        expect(headers).toEqual(['Errors (1)', 'Warnings (2)', 'Deprecations (1)']);
    });

    test('omits sections for severities with no diagnostics', () => {
        const nodes = renderDiagnosticSections([warning]);
        const headers = sectionsOf(nodes).map((s) => s.querySelector('.ag-overlay-error-section-header')!.textContent);
        expect(headers).toEqual(['Warnings (1)']);
    });

    test('inserts an <hr> divider between sections but not within a section', () => {
        const nodes = renderDiagnosticSections([error, warning, warning]);
        const dividers = nodes.filter((node) => node.tagName === 'HR');
        expect(dividers).toHaveLength(1);
        expect(dividers[0].classList.contains('ag-overlay-error-divider')).toBe(true);

        const warningSection = nodes.find((node) => node.classList.contains('ag-overlay-error-section-warning'))!;
        expect(warningSection.querySelectorAll('hr')).toHaveLength(0);
        expect(warningSection.querySelectorAll('.ag-overlay-error-item')).toHaveLength(2);
    });

    test('renders no divider for a single section', () => {
        const nodes = renderDiagnosticSections([deprecation, deprecation]);
        expect(nodes.filter((node) => node.tagName === 'HR')).toHaveLength(0);
    });

    test('applies the per-severity accent class to each section', () => {
        const sections = sectionsOf(renderDiagnosticSections([error, warning, deprecation]));
        expect(sections[0].querySelector('.ag-overlay-error-item-error')).not.toBeNull();
        expect(sections[1].querySelector('.ag-overlay-error-item-warning')).not.toBeNull();
        expect(sections[2].querySelector('.ag-overlay-error-item-deprecation')).not.toBeNull();
    });
});
