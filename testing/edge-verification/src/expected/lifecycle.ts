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
    gridArchiveMarkdown: 'grid#15434 / #15435 (archive markdown negotiation, release-candidate archives uncached)',
    gridVaryHtml: 'grid#15434 / #15435 (Vary: Accept on HTML incl. DirectoryIndex)',
    gridArchiveRedirects: 'grid#15434 / #15435 (archive .htaccess redirects stay inside the archive)',
    gridNoCache: 'grid#15434 / #15435 (no-cache on 3xx and live markdown, X-Robots-Tag: noindex on archived markdown)',
    gridGzipRevalidation: 'grid#15434 / #15435 (If-None-Match without the -gzip ETag suffix)',
    /**
     * The change that stops uploadAndUnzipArchive.sh stamping extraction time on each host.
     * It only helps an archive extracted after it: archives already deployed keep their per-host
     * mtimes, which is accepted, so only an archive uploaded after it is checked.
     */
    archiveMtimes: 'grid#15434 / #15435 (archive extract keeps mtimes), first live with the 36.3.0 archive',
    chartsHosts: 'ag-charts#8440 / #8441 (one-hop host canonicalisation and redirects under /charts, Vary on HTML)',
    chartsLegacyPrefixes:
        'ag-charts#8440 / #8441 (legacy-prefix redirects: files keep their path, renamed slugs in one hop)',
    chartsSeo: 'ag-charts#8440 / #8441 (one H1 and one <main>, absolute social images, /charts/options/ link)',
    studioHosts: 'ag-studio#3096 / #3097 (one-hop host canonicalisation under /studio, Vary on HTML)',
    studioSeo: 'ag-studio#3096 / #3097 (one <main>, absolute social images, initial-scale=1)',
    gridDefaultCache:
        'grid#15434 / #15435 (a default Cache-Control in the root .htaccess, so nothing is left to a heuristic lifetime; no-cache on live markdown, feeds and example code)',
    /** Not a PR: Sean pastes the generated block into the Ghost box's vhost by hand. */
    blogVhostCap:
        "blog vhost block from generate-csp.ts --scope=blog (grid#15434 / #15435), pasted on the Ghost box: 7-day cap on /blog/content/ and on Ghost's 301s",
    gridOneHopSlash:
        'grid#15434 / #15435 (slash-less directory URLs on alias hosts reach the slashed www URL in one hop)',
    gridAcme: 'grid#15434 / #15435 (add-slash rules skip /.well-known/acme-challenge/ and the other DCV tokens)',
    gridServerSideOneHop:
        'grid#15434 / #15435 (24 server-side single-hop rewrites, /documentation/<fw>/charts* ahead of the prefix)',
    gridLlmsDataGrid:
        'grid#15434 / #15435 (llms.txt "Data Grid" points at /javascript-data-grid/getting-started/, not the JavaScript forwarder)',
    gridBuilding: 'grid#15434 / #15435 (/angular|react|vue-data-grid/building/ go to installation, like JavaScript)',
    gridRobotsTwinsQuery:
        'grid#15434 / #15435 (a .md? twin rule beside each .md$ rule, so a query string does not reopen it)',
    gridRobotsTwins:
        'grid#15434 / #15435 (a .md$ rule per directory Allow/Disallow, Allow: /archive/$ and /charts/archive/$)',
    /** Run once per web host; both hosts serve every archive, so verify after the second. */
    archiveMigration:
        'grid#15434 / #15435: migrateDeployedArchiveHtaccess.sh --apply on BOTH web hosts (patches already-deployed archive .htaccess files)',
    p11AgentAllowlist:
        'extend-p11-agent-allowlist.sh (18 agent UA tokens in the p11 allowlist + count-allowlisted-agents-rate)',
    redactLogs: 'redact-waf-log-secrets.sh',
    datacenterAfterAgents: 'move-datacenter-block-after-agent-exemptions.sh',
    archiveCache: 'add-archive-cache-behaviors.sh',
    /** Opt-in, awaiting approval; independent of the other WAF scripts. */
    p11MarkdownScoped: 'tighten-p11-markdown-exemption.sh (p11 honours Accept: text/markdown only on negotiable paths)',
    /** Independent of the other WAF scripts: Count for a week, then the same script with --mode block. */
    blogSqliCount: 'add-blog-sqli-rule.sh (block-blog-sqli first in the ACL, Count)',
    blogSqliBlock: 'add-blog-sqli-rule.sh --mode block (block-blog-sqli from Count to Block)',
    captchaServedSilenced:
        'change-captcha-alarm.sh (waf-p11-captcha-served keeps evaluating, actions disabled; waf-p11-captcha-solved alone notifies)',
} as const;
