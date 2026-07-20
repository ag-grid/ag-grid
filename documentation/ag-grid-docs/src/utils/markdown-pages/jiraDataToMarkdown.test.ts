import { describe, expect, it } from 'vitest';

import {
    changelogToMarkdown,
    htmlToText,
    pipelineToMarkdown,
} from '../../../../../scripts/jira/production/jiraDataToMarkdown.mjs';

const changelogEntries = [
    {
        key: 'AG-2000',
        issueType: 'Task',
        summary: 'Placeholder for 34.0.0',
        versions: ['34.0.0'],
        breakingChangesNotes: null,
        deprecationNotes: null,
        documentationUrl: null,
    },
    {
        key: 'AG-1500',
        issueType: 'Task',
        summary: 'Remove deprecated option',
        versions: ['33.0.0'],
        breakingChangesNotes: '<p>The <code>oldOption</code> has been removed. Use <code>newOption</code>.</p>',
        deprecationNotes: null,
        documentationUrl: 'https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/',
    },
    {
        key: 'AG-1499',
        issueType: 'Bug',
        summary: 'Deprecate legacy API',
        versions: ['33.0.0'],
        breakingChangesNotes: null,
        deprecationNotes: 'legacyMethod is deprecated. Use modernMethod instead.',
        documentationUrl: null,
    },
    {
        key: 'AG-100',
        issueType: 'Bug',
        summary: 'A change with | a pipe',
        versions: [],
        breakingChangesNotes: null,
        deprecationNotes: null,
        documentationUrl: null,
    },
];

const pipelineEntries = [
    { key: 'AG-3000', issueType: 'Task', summary: 'Next release feature', versions: ['NEXT'] },
    { key: 'AG-2900', issueType: 'Bug', summary: 'Scheduled fix', versions: ['34.1.0'] },
    { key: 'AG-2800', issueType: 'Bug', summary: 'Older scheduled fix', versions: ['33.5.0'] },
    { key: 'AG-2700', issueType: 'Task', summary: 'Idea bucket item', versions: ['Ideas'] },
    { key: 'AG-2600', issueType: 'Task', summary: 'Backlog item', versions: [] },
];

describe('changelogToMarkdown', () => {
    const output = changelogToMarkdown(changelogEntries);

    it('emits frontmatter and the page H1', () => {
        expect(output.startsWith('---\n')).toBe(true);
        expect(output).toContain('title: "AG Grid Changelog"');
        expect(output).toContain('\n# AG Grid Changelog');
    });

    it('lists breaking changes grouped by version, with HTML flattened and a docs link', () => {
        expect(output).toContain('## Breaking Changes');
        expect(output).toContain('### 33.0.0');
        expect(output).toContain(
            '- **AG-1500** — Remove deprecated option: The `oldOption` has been removed. Use `newOption`.' +
                ' ([docs](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/))'
        );
    });

    it('lists deprecations in their own section', () => {
        expect(output).toContain('## Deprecations');
        expect(output).toContain(
            '- **AG-1499** — Deprecate legacy API: legacyMethod is deprecated. Use modernMethod instead.'
        );
    });

    it('renders All Changes as per-version tables, newest first, with type labels', () => {
        expect(output).toContain('## All Changes');
        expect(output).toContain('| Issue | Type | Summary |');
        // Feature Request for Task, Defect for Bug.
        expect(output).toContain('| AG-2000 | Feature Request | Placeholder for 34.0.0 |');
        // 34.0.0 table appears before the 33.0.0 table.
        expect(output.indexOf('### 34.0.0')).toBeLessThan(output.lastIndexOf('### 33.0.0'));
        // Versionless entries fall into an Unversioned bucket with pipes escaped.
        expect(output).toContain('### Unversioned');
        expect(output).toContain('| AG-100 | Defect | A change with \\| a pipe |');
    });

    it('ends with a single trailing newline', () => {
        expect(output.endsWith('\n')).toBe(true);
        expect(output.endsWith('\n\n')).toBe(false);
    });

    it('shows a placeholder when a lead section has no entries', () => {
        const output = changelogToMarkdown([
            { key: 'AG-1', issueType: 'Task', summary: 'Only change', versions: ['1.0.0'] },
        ]);
        expect(output).toMatch(/## Breaking Changes\n\n[^\n]+\n\n_None recorded\._/);
    });
});

describe('pipelineToMarkdown', () => {
    const output = pipelineToMarkdown(pipelineEntries);

    it('groups by derived status, next release then newest scheduled, buckets, then backlog', () => {
        const order = [
            '## Scheduled\n',
            '## Scheduled for 34.1.0',
            '## Scheduled for 33.5.0',
            '## Scheduled for Ideas',
            '## Backlog',
        ];
        const positions = order.map((heading) => output.indexOf(heading));
        expect(positions.every((position) => position >= 0)).toBe(true);
        expect(positions).toEqual([...positions].sort((a, b) => a - b));
    });

    it('renders each group as an issue table', () => {
        expect(output).toContain('| AG-3000 | Feature Request | Next release feature |');
        expect(output).toContain('| AG-2600 | Feature Request | Backlog item |');
    });
});

describe('htmlToText', () => {
    it('flattens list markup and decodes entities to a single line', () => {
        expect(htmlToText('<ul><li>one</li><li>two &amp; three</li></ul>')).toBe('- one - two & three');
    });

    it('returns an empty string for nullish input', () => {
        expect(htmlToText(null)).toBe('');
        expect(htmlToText(undefined)).toBe('');
    });
});
