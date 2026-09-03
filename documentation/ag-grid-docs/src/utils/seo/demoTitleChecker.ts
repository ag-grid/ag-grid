import type { AstroIntegrationLogger } from 'astro';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// The layout has no title fallback of its own (see Layout.astro) — this is the literal template
// every demo page used before it had a real SEO title. Anchored at the start so an approved title
// that merely contains "Demo" elsewhere (eg "Inventory Management System Demo - Data Grid | AG
// Grid") still passes.
const FALLBACK_TITLE_PATTERN = /^Demo - /;

type Violation = {
    path: string;
    title: string;
};

function findHtmlFiles(buildDir: string): string[] {
    return (readdirSync(buildDir, { recursive: true }) as string[]).filter((file) => file.endsWith('.html'));
}

function extractTitle(html: string): string | undefined {
    return /<title>([^<]*)<\/title>/i.exec(html)?.[1];
}

export function findFallbackDemoTitles(buildDir: string): Violation[] {
    return findHtmlFiles(buildDir)
        .flatMap((file) => {
            const title = extractTitle(readFileSync(path.join(buildDir, file), 'utf8'));
            return title && FALLBACK_TITLE_PATTERN.test(title) ? [{ path: file, title }] : [];
        })
        .sort((a, b) => a.path.localeCompare(b.path));
}

export function demoTitleChecker({ buildDir, logger }: { buildDir: string; logger: AstroIntegrationLogger }) {
    const violations = findFallbackDemoTitles(buildDir);

    if (violations.length) {
        const details = violations.map(({ path, title }) => `  ${path}: "${title}"`).join('\n');
        throw new Error(
            `Page(s) still resolve to the "Demo - {name}" fallback title. Give them a real SEO title:\n${details}`
        );
    }

    logger.info('Demo title checker: no pages resolve to the "Demo - " fallback title.');
}
