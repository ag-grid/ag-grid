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

    test('extracts the module documentation link and removes it from the prose', () => {
        const raw = 'Register the module. For more info see: https://ag-grid.com/javascript-data-grid/modules';
        const content = parseDiagnosticText(raw);
        expect(content.modulesDocLink).toBe('https://ag-grid.com/javascript-data-grid/modules');
        expect(content.message).not.toContain('For more info see');
    });
});

describe('renderDiagnosticElement', () => {
    test('renders the severity class, error-code link and module-docs link', () => {
        const el = renderDiagnosticElement(
            'warning',
            { message: 'something', modulesDocLink: 'https://ag-grid.com/modules' },
            'https://ag-grid.com/errors/22',
            'AG Grid #22'
        );
        expect(el.classList.contains('ag-overlay-error-item')).toBe(true);
        expect(el.classList.contains('ag-overlay-error-item-warning')).toBe(true);

        const links = el.querySelectorAll<HTMLAnchorElement>('a.ag-overlay-error-link');
        expect(links).toHaveLength(2);
        expect(links[0].href).toContain('/errors/22');
        expect(links[0].textContent).toBe('AG Grid #22');
        expect(links[1].textContent).toBe('Modules Documentation');
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
        expect(message.textContent).toBe('see https://ag-grid.com/x.');
    });
});

describe('diagnosticContentToMarkdown', () => {
    test('includes the severity, id, docs link and fenced code', () => {
        const md = diagnosticContentToMarkdown(
            'error',
            200,
            { message: 'No module.', code: 'ModuleRegistry.registerModules([ X ]);' },
            'https://ag-grid.com/errors/200'
        );
        expect(md).toContain('### error #200');
        expect(md).toContain('No module.');
        expect(md).toContain('```');
        expect(md).toContain('ModuleRegistry.registerModules([ X ]);');
        expect(md).toContain('Docs: https://ag-grid.com/errors/200');
    });

    test('strips backticks from prose', () => {
        const md = diagnosticContentToMarkdown('warning', 22, { message: 'Use `foo`.' }, 'https://x/errors/22');
        expect(md).toContain('Use foo.');
        expect(md).not.toContain('`');
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
        expect(md).toContain('### warning #22');
        expect(md).toContain('/errors/22');
    });
});
