// Type declarations for the plain-JS transform, so the Astro .md endpoints and the
// unit tests can import it type-safely. The runtime module is an ES module (jiraDataToMarkdown.mjs).

export interface JiraEntry {
    key: string;
    issueType: string;
    summary: string;
    versions?: string[];
    status?: string;
    deprecationNotes?: string | null;
    breakingChangesNotes?: string | null;
    moreInformation?: string | null;
    documentationUrl?: string | null;
    [key: string]: unknown;
}

export function changelogToMarkdown(entries: JiraEntry[], product?: string, siteUrl?: string): string;
export function pipelineToMarkdown(entries: JiraEntry[], product?: string, siteUrl?: string): string;
export function htmlToText(html: string | null | undefined): string;
