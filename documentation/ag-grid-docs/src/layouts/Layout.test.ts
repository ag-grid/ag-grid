import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// The layouts are Astro templates, which these tests cannot render, so the one `<main>` landmark
// (SE-49) is checked on the template source, as the charts and studio sites do.
const SRC = fileURLToPath(new URL('..', import.meta.url));
const SHARED = join(SRC, '../../../external/ag-website-shared/src');

// Strip the frontmatter script and comments, leaving markup.
const markup = (text: string) =>
    text
        .replace(/^---[\s\S]*?\n---\n/, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const templates = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            return templates(path);
        }
        return /\.(astro|tsx|jsx)$/.test(name) ? [path] : [];
    });

describe('the <main> landmark (SE-49)', () => {
    const layout = markup(readFileSync(join(SRC, 'layouts/Layout.astro'), 'utf8'));

    it('renders exactly one <main> around the page slot, whichever transition branch is taken', () => {
        // Each branch closes on a line of its own; `fade({ ... })}` inside the second must not end it.
        const branches = /\{\s*noMainTransition \? \(([\s\S]*?)\n\s*\) : \(([\s\S]*?)\n\s*\)\s*\}/.exec(layout);
        expect(branches).not.toBeNull();
        for (const branch of branches!.slice(1)) {
            expect(branch.match(/<main\b/g)).toHaveLength(1);
            expect(branch).toMatch(/<main\b[^>]*>\s*<slot\s*\/>\s*<\/main>/);
        }
        // Nothing else in the layout opens a <main>: only the two exclusive branches do.
        expect(layout.match(/<main\b/g)).toHaveLength(2);
    });

    it('declares no other <main>, so no page ends up with two', () => {
        const others = [...templates(SRC), ...templates(SHARED)]
            .filter((path) => path !== join(SRC, 'layouts/Layout.astro'))
            .filter((path) => /<main\b/.test(markup(readFileSync(path, 'utf8'))))
            .map((path) => relative(SRC, path));
        expect(others).toEqual([]);
    });
});
