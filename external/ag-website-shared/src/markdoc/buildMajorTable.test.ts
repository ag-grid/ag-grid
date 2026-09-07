import { describe, expect, it } from 'vitest';

import { type MajorTableVersionEntry, buildMajorTable } from './buildMajorTable';

const VERSIONS: MajorTableVersionEntry[] = [
    { version: '2.0.0', date: 'June 25th, 2026', notesPath: './upgrading-to-ag-studio-2' },
    { version: '1.1.1', date: 'June 2nd, 2026', notesPath: '/changelog/?fixVersion=1.1.1' },
    { version: '1.0.0', date: 'March 26th, 2026', notesPath: '/changelog/?fixVersion=1.0.0' },
    { version: '1.0.0-beta', date: 'March 1st, 2026', noDocs: true },
];

const resolveNotesUrl = (notesPath: string) => `https://example.test${notesPath}`;

function build(attributes: Record<string, unknown>) {
    return buildMajorTable({
        versions: VERSIONS,
        attributes,
        defaultLibrary: 'studio',
        resolveNotesUrl,
    });
}

describe('buildMajorTable', () => {
    it('links a major whose notes are an upgrade guide to the migration guide', () => {
        expect(build({ major: 2, type: 'migration' })).toBe(
            [
                '| Version | Date | Type | Guide |',
                '| --- | --- | --- | --- |',
                '| 2.0.0 | June 25th, 2026 | Major | [Migration Guide](https://example.test./upgrading-to-ag-studio-2) |',
            ].join('\n')
        );
    });

    it('links versions whose notes point at the changelog to release notes', () => {
        const table = build({ major: 1, type: 'migration' });
        expect(table).toContain('| 1.1.1 | June 2nd, 2026 | Patch | [Release Notes]');
        // A major is still "Release Notes" when its notesPath is a changelog link.
        expect(table).toContain('| 1.0.0 | March 26th, 2026 | Major | [Release Notes]');
    });

    it('omits versions without a notesPath from the migration table', () => {
        expect(build({ major: 1, type: 'migration' })).not.toContain('1.0.0-beta');
    });

    it('builds an archive table with changelog and documentation links', () => {
        const table = build({ major: 1, type: 'archive' });
        expect(table).toContain('| Version | Date | Type | Changelog | Documentation |');
        expect(table).toContain('[Changelog](https://www.ag-grid.com/studio/changelog/?fixVersion=1.1.1)');
        expect(table).toContain('[1.1.1 Documentation](https://www.ag-grid.com/studio/archive/1.1.1/)');
    });

    it('drops the changelog column when suppressChangelog is set', () => {
        const table = build({ major: 1, type: 'archive', suppressChangelog: true });
        expect(table).toContain('| Version | Date | Type | Documentation |');
        expect(table).not.toContain('[Changelog]');
    });

    it('excludes noDocs versions from the archive table', () => {
        expect(build({ major: 1, type: 'archive' })).not.toContain('1.0.0-beta');
    });

    it('honours an explicit library attribute over the product default', () => {
        expect(build({ major: 1, type: 'archive', library: 'charts' })).toContain('https://www.ag-grid.com/charts');
    });

    it('defaults to a migration table and returns nothing without a major', () => {
        expect(build({ major: 2 })).toContain('| Guide |');
        expect(build({ type: 'archive' })).toBe('');
    });
});
