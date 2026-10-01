/**
 * Lifecycle markers shared by every declarative expectation. See CheckDef in core/types.ts.
 * Keep the references specific: a reviewer should be able to open the PR, script or finding.
 */
export interface Lifecycle {
    /** Not live yet; deployed by this PR or script. Evaluated only with --pending. */
    pending?: string;
    /** Verified current defect, by waf-finding.md section. */
    knownIssue?: string;
    /** The change expected to fix a known issue. */
    fixedBy?: string;
}

export const finding = (section: number | string): string => `waf-finding.md §${section}`;

/** The ref for defects this suite found itself rather than waf-finding.md. */
export const FIRST_RUN = 'edge-verification first run 2026-10-01';

/** A verified defect first reported by this suite rather than by waf-finding.md. */
export const NEW_FINDING = (what: string): string => `${FIRST_RUN}: ${what} (not in waf-finding.md)`;

/** Pending changes, named once so every expectation that depends on one cites it identically. */
export const PENDING = {
    gridArchiveMarkdown: 'grid#15411 / #15412 (archive markdown negotiation, release-candidate archives uncached)',
    gridVaryHtml: 'grid#15411 / #15412 (Vary: Accept on HTML incl. DirectoryIndex)',
    gridArchiveRedirects: 'grid#15416 / #15417 (archive .htaccess redirects stay inside the archive)',
    /** The #15416 follow-up commit on archive-rewrite-prefix. */
    gridNoCache:
        'grid#15416 follow-up c0eadabc4e3 (no-cache on 3xx and live markdown, X-Robots-Tag: noindex on archived markdown)',
    chartsHosts:
        'ag-charts#8422 + charts test branch (one-hop host canonicalisation and redirects under /charts, Vary on HTML)',
    studioHosts: 'ag-studio#3084 + studio test branch (one-hop host canonicalisation under /studio, Vary on HTML)',
    studioNoOffers: 'ag-studio test branch commit cfe305f0e (drops the "AG Studio Community" price-0 offer)',
    redactLogs: 'redact-waf-log-secrets.sh',
    datacenterAfterAgents: 'move-datacenter-block-after-agent-exemptions.sh',
    archiveCache: 'add-archive-cache-behaviors.sh',
} as const;
