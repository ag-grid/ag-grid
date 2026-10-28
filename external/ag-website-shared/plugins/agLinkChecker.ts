import junitProcessor from 'ag-shared/processor';
import type { AstroIntegration } from 'astro';
import fs, { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';

import {
    describeInternalLinkShapeIssue,
    getCanonicalHostPath,
    getInternalLinkShapeIssues,
    isInternalHref,
} from '../src/utils/internalLinkShape';
import {
    type LinkFinding,
    findingKey,
    parseBaseline,
    partitionByBaseline,
    serialiseBaseline,
} from '../src/utils/linkBaseline';
import { LinkLabelTracker } from '../src/utils/linkLabel';

const { TestSuites, TestSuite, TestCase } = junitProcessor;

type Options = {
    include: boolean;
    prefix?: string;
    /**
     * Framework agnostic redirect pages, eg `/r/{page}`, which forward the visitor's query
     * and fragment on to `/{framework}/{page}`. Their own markup is a redirecting stub, so
     * anchor links to them are validated against the framework pages they forward to.
     */
    frameworkRedirect?: { path: string; frameworks: readonly string[] };
    /**
     * Fragment prefixes whose target elements are rendered client-side, so the built HTML
     * holds nothing to validate them against. Sites that server-render those targets should
     * leave this unset and keep the stricter check.
     */
    clientRenderedFragmentPrefixes?: readonly string[];
    /**
     * Validates absolute links to the canonical host (`https://www.ag-grid.com/page/`) against the
     * built pages, the way root-relative links are. Other sites are served from the same host, and
     * have no pages in this build, so this has to say which paths belong to them. Sites that link
     * to their siblings absolutely and do not know where they live should leave this unset.
     */
    checkCanonicalHostLinks?: { isServedElsewhere: (pathname: string) => boolean };
    /**
     * The address a request for `pathname` ends up at after the site's redirects, or undefined when
     * it is served directly. A link to a page the build lacks is reported as a redirect, naming where
     * it goes, when the site redirects the address: the old address is the thing to fix. Only
     * consulted for a link the build cannot resolve, so a redirect that shadows a page that exists is
     * for the redirect checker to catch.
     */
    resolveRedirect?: (request: {
        pathname: string;
        fileExists: (urlPath: string) => boolean;
        dirExists: (urlPath: string) => boolean;
    }) => string | undefined;
    /**
     * A JSON file of the known problems the build tolerates, keyed by rule (see `linkBaseline`). Only
     * a link that breaks a rule and is not listed fails the build. Rewritten with the current
     * problems instead of failing when `UPDATE_LINK_BASELINE=true`; run that build with
     * `--skip-nx-cache`, or the cached build will not run this check at all.
     */
    baselineFile?: string;
};

type FoundFinding = LinkFinding & { filePaths: Set<string> };

const IGNORED_PATHS = ['/archive'];
/** A letters-only extension marks a file link, which is looked up directly rather than as a page. */
const FILE_EXTENSION = /\.[a-zA-Z]+$/;
/**
 * Fragments that a client-side script intercepts rather than scrolling to an element, so
 * the built HTML has no target for them. Every other fragment must resolve to an `id` or
 * `<a name>` in the built page it points at.
 */
const CLIENT_HANDLED_FRAGMENTS = [
    'manage_cookies', // Footer link that opens the cookie-consent preferences modal
];

/**
 * The named character references that can appear in an href. The numeric forms below cover
 * everything else, so only the handful HTML gives names to are spelled out here.
 */
const NAMED_HTML_ENTITIES: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: '\u00a0',
    quot: '"',
};

/**
 * Decodes the character references in an href. Attribute values are read out of the raw HTML,
 * so they arrive still encoded and have to be decoded before the href is picked apart: the `#`
 * of a reference such as `&#38;` (the `&` between query parameters) would otherwise read as a
 * fragment marker, turning `/gallery/?a=1&#38;b=2` into the unresolvable `/gallery/#38;b=2`.
 */
const decodeHtmlEntities = (value: string): string =>
    value.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (reference, body: string) => {
        if (!body.startsWith('#')) {
            return NAMED_HTML_ENTITIES[body.toLowerCase()] ?? reference;
        }
        const isHex = body[1].toLowerCase() === 'x';
        const codePoint = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
        // Lone surrogates and out-of-range values would throw; leave them as they were.
        if (!Number.isInteger(codePoint) || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
            return reference;
        }
        return String.fromCodePoint(codePoint);
    });

/**
 * Drops the whole query string (`?a=1&b=2`) while keeping the path and fragment, so
 * `/page/?ref=blog#foo` still validates the page and its `#foo` anchor. Only a `?` before
 * the fragment starts a query; one after `#` is part of the fragment itself.
 */
const stripQueryString = (href: string): string => {
    const hashIndex = href.indexOf('#');
    const queryIndex = href.indexOf('?');
    if (queryIndex === -1 || (hashIndex !== -1 && hashIndex < queryIndex)) {
        return href;
    }
    return href.slice(0, queryIndex) + (hashIndex === -1 ? '' : href.slice(hashIndex));
};

const isCI =
    process.env.NX_TASK_TARGET_CONFIGURATION === 'ci' || process.env.NX_TASK_TARGET_CONFIGURATION === 'staging';

const findAllFiles = (dir: string): string[] => {
    const results: string[] = [];
    const files = readdirSync(dir, { recursive: true });
    files.forEach((file) => {
        results.push(file);
    });
    return results;
};

const filePathToUrl = (filePath: string) => {
    return `/${filePath.replace('index.html', '')}`;
};

const shiftablePatterns = [/.*-data-grid/, /javascript|react|angular|vue/];
const filePathsString = (filePaths: Set<string>, options: Options): string => {
    const { prefix } = options;
    const pageNames = Array.from(filePaths).map((filePath) => {
        if (prefix != null && filePath.startsWith(prefix)) {
            filePath = filePath.slice(prefix.length);
        }
        const filePathParts = filePath.split('/');
        if (filePathParts.at(-1) === 'index.html') {
            filePathParts.pop();
        }
        // Take page name from path
        // eg, javascript-data-grid/grid-options/index.html
        if (filePathParts.length > 1 && shiftablePatterns.some((p) => filePathParts[0].match(p))) {
            filePathParts.shift();
        }
        return filePathParts.join('/');
    });

    return [...new Set(pageNames)].join(', ');
};

function outputJunitReport(validationResults: any) {
    const testSuites = new TestSuites('Link Checker Tests');
    Object.keys(validationResults).forEach((link) => {
        const testSuite = new TestSuite(link);
        testSuites.addTestSuite(testSuite);

        const testCase = new TestCase(link, link, 0.0);
        if (validationResults[link].error) {
            testCase.setFailure(validationResults[link].error);
        }
        testSuite.addTestCase(testCase);
    });

    if (isCI) {
        testSuites.writeJunitReport(path.resolve('../../reports/ag-grid-docs-links.xml'), true);
    }
}

const checkLinks = async (dir: string, files: string[], options: Options) => {
    const anchors = new Set<string>();
    const linksToValidate: Record<string, { filePaths: Set<string> }> = {};
    // Every rule the links break, keyed by rule and href so that a link repeated across pages is one
    // finding. Shape issues (no trailing slash, non-canonical host, UTM parameters, ...) are recorded
    // for every internal link, including the absolute `https://www.ag-grid.com/...` ones and the
    // client-handled fragment links the existence checks below leave alone, because the redirect
    // happens before the target is consulted.
    const found = new Map<string, FoundFinding>();
    const addFinding = (finding: LinkFinding, filePaths: Iterable<string>) => {
        const key = findingKey(finding);
        const entry = found.get(key) ?? { ...finding, filePaths: new Set<string>() };
        for (const filePath of filePaths) {
            entry.filePaths.add(filePath);
        }
        found.set(key, entry);
    };
    const { prefix, frameworkRedirect, clientRenderedFragmentPrefixes, checkCanonicalHostLinks, resolveRedirect } =
        options;

    const fileSet = new Set(files);
    // A page served as `foo.html` rather than `foo/index.html` has no trailing-slash form.
    const isHtmlFile = (pathname: string) => {
        let relative = pathname;
        if (prefix != null && relative.startsWith(prefix)) {
            relative = relative.slice(prefix.length);
        }
        if (relative.startsWith('/')) {
            relative = relative.slice(1);
        }
        return fileSet.has(`${relative}.html`);
    };

    for (let i = 0; i < files.length; i++) {
        const filePath = files[i];
        if (!filePath.endsWith('index.html') || filePath.startsWith('example')) {
            // don't search non-html files, or example files.
            continue;
        }

        const thisFileUrl = filePathToUrl(filePath);

        const recordShapeIssues = (href: string) => {
            for (const issue of getInternalLinkShapeIssues(href, { isHtmlFile })) {
                addFinding({ rule: issue.type, subject: href, message: describeInternalLinkShapeIssue(issue) }, [
                    filePath,
                ]);
            }
        };

        const recordUsage = (href: string) => {
            recordShapeIssues(href);

            href = stripQueryString(href);

            // An empty fragment (#) or #top both scroll to the top of the page;
            // they always resolve and have no target element to check against.
            const hashIndex = href.indexOf('#');
            if (hashIndex !== -1) {
                const fragment = href.slice(hashIndex + 1);
                if (fragment === '' || fragment.toLowerCase() === 'top') {
                    return;
                }
                if (CLIENT_HANDLED_FRAGMENTS.includes(fragment)) {
                    return;
                }
                if (clientRenderedFragmentPrefixes?.some((candidate) => fragment.startsWith(candidate))) {
                    return;
                }
            }
            // An absolute link to the canonical host is served by this build at the same path,
            // so it is validated as the root-relative link it stands for.
            if (checkCanonicalHostLinks != null) {
                const canonicalPath = getCanonicalHostPath(href);
                if (canonicalPath != null) {
                    const pathname = canonicalPath.split('#')[0];
                    if (checkCanonicalHostLinks.isServedElsewhere(pathname)) {
                        return;
                    }
                    if (prefix != null && !pathname.startsWith(prefix)) {
                        return;
                    }
                    href = canonicalPath;
                }
            }
            // Same-page (#foo) links resolve against this page; absolute
            // (/page#foo) links resolve against another page. Anything else
            // (external, relative) is left to the file-existence checks below.
            let link: string | undefined;
            if (href.startsWith('#')) {
                link = `${thisFileUrl}${href}`;
            } else if (href.startsWith('/')) {
                link = href;
            }
            if (link == null) {
                return;
            }
            const filePaths = linksToValidate[link]?.filePaths ?? new Set();
            filePaths.add(filePath);
            linksToValidate[link] = { filePaths };
        };

        const processTag = (tag: string) => {
            // A fragment (#foo) resolves to the first element with id="foo",
            // and failing that an <a name="foo">. Record both as valid targets.
            const idMatch = /(?:^|\s)id=(["'])(.*?)\1/i.exec(tag);
            if (idMatch) {
                anchors.add(`${thisFileUrl}#${idMatch[2]}`);
            }

            const tagName = /^([a-zA-Z][\w-]*)/.exec(tag)?.[1]?.toLowerCase();
            if (tagName === 'a') {
                const nameMatch = /(?:^|\s)name=(["'])(.*?)\1/i.exec(tag);
                if (nameMatch) {
                    anchors.add(`${thisFileUrl}#${nameMatch[2]}`);
                }

                const hrefMatch = /(?:^|\s)href=(["'])(.*?)\1/i.exec(tag);
                if (hrefMatch) {
                    recordUsage(decodeHtmlEntities(hrefMatch[2]));
                }
            }
        };

        const labelTracker = new LinkLabelTracker((rawHref) => {
            const href = decodeHtmlEntities(rawHref);
            if (isInternalHref(href)) {
                addFinding(
                    {
                        rule: 'unlabelled-link',
                        subject: href,
                        message: `Link ${href} has no text, image alt text or label; give it one so that assistive technology and crawlers can tell where it goes.`,
                    },
                    [filePath]
                );
            }
        });

        // Stream the file rather than reading it whole (large files caused OOM
        // crashes). We accumulate one tag at a time, from '<' to '>', and
        // process it the moment it closes. The accumulator state lives outside
        // the chunk loop so a tag straddling a chunk boundary isn't dropped.
        // The text between tags is only kept while a link is open and still unlabelled.
        const fileStream = fs.createReadStream(join(dir, filePath), { encoding: 'utf8' });
        let inTag = false;
        let tag = '';
        let textRun = '';
        for await (const chunk of fileStream) {
            const strChunk = chunk as string;
            for (let i = 0, len = strChunk.length; i < len; ++i) {
                const chr = strChunk[i];
                if (inTag) {
                    if (chr === '>') {
                        inTag = false;
                        processTag(tag);
                        labelTracker.tag(tag);
                        tag = '';
                    } else {
                        tag += chr;
                    }
                } else if (chr === '<') {
                    if (textRun !== '') {
                        labelTracker.text(textRun);
                        textRun = '';
                    }
                    inTag = true;
                    tag = '';
                } else if (labelTracker.wantsText) {
                    textRun += chr;
                }
            }
        }
        labelTracker.finish();
    }

    const hasAnchor = (link: string) => anchors.has(link) || anchors.has(link.replace('#', '/#'));

    /**
     * The framework specific equivalents of a link to a framework agnostic redirect page,
     * which sends the visitor on to whichever framework they last used, fragment included.
     * Empty for any other link, and when the site has no such pages.
     */
    const frameworkRedirectLinks = (link: string): string[] => {
        if (frameworkRedirect == null) {
            return [];
        }
        const { path, frameworks } = frameworkRedirect;
        const redirectPrefix = `/${path}/`;
        if (!link.startsWith(redirectPrefix)) {
            return [];
        }
        return frameworks.map((framework) => `/${framework}/${link.slice(redirectPrefix.length)}`);
    };

    // for junit reporting
    const validationResults = {};

    const pageExists = (pagePath: string) => {
        // if this is a file, do direct lookup in files list
        if (FILE_EXTENSION.test(pagePath)) {
            return files.includes(pagePath);
        }
        // if this is a directory, check for index.html; it might be a html file itself...
        const dirHtml = `${!pagePath || pagePath.endsWith('/') ? pagePath : `${pagePath}/`}index.html`;
        return (
            files.includes(dirHtml) ||
            files.includes(`${pagePath.endsWith('/') ? pagePath.slice(0, -1) : pagePath}.html`)
        );
    };

    const statUrlPath = (urlPath: string) => statSync(join(dir, urlPath), { throwIfNoEntry: false });
    const redirectTargets = new Map<string, string | undefined>();
    /**
     * Where the site's redirects send a request for `pathname`, or undefined when there are none. The
     * trailing slash is added first, as the missing slash is reported as a shape issue of its own.
     * The redirects describe the production site root, so a build served under a prefix has none.
     */
    const redirectTarget = (pathname: string): string | undefined => {
        if (resolveRedirect == null || prefix != null) {
            return undefined;
        }
        const isFinalForm = pathname.endsWith('/') || FILE_EXTENSION.test(pathname) || isHtmlFile(pathname);
        const requested = isFinalForm ? pathname : `${pathname}/`;
        if (!redirectTargets.has(requested)) {
            redirectTargets.set(
                requested,
                resolveRedirect({
                    pathname: requested,
                    fileExists: (urlPath) => statUrlPath(urlPath)?.isFile() ?? false,
                    dirExists: (urlPath) => statUrlPath(urlPath)?.isDirectory() ?? false,
                })
            );
        }
        return redirectTargets.get(requested);
    };

    // validate the unchecked links
    Object.entries(linksToValidate).forEach(([link, { filePaths }]) => {
        if (IGNORED_PATHS.includes(link)) return;

        validationResults[link] = {};

        const originalLink = link;
        if (prefix != null && link.startsWith(prefix)) {
            link = link.slice(prefix.length);
        }
        const linkWithoutPrefix = link;
        if (link.startsWith('/')) {
            link = link.slice(1);
        }

        const hashIndex = link.indexOf('#');
        const pagePath = hashIndex === -1 ? link : link.slice(0, hashIndex);

        // A page the build lacks that the site redirects is a link to an old address: report the
        // address to link to rather than that the old one is missing. The fragment of a page the
        // build has is just missing, whatever the site redirects.
        const reportMissing = (rule: string, message: string, reportKey: string) => {
            const pathname = `/${pagePath}`;
            const redirectedTo = pageExists(pagePath) ? undefined : redirectTarget(pathname);
            addFinding(
                redirectedTo == null
                    ? { rule, subject: originalLink, message, reportKey }
                    : {
                          rule: 'redirecting-link',
                          subject: originalLink.split('#')[0],
                          message: `Link ${pathname} redirects to ${redirectedTo}; link to the final address directly.`,
                          reportKey,
                      },
                filePaths
            );
        };

        if (hashIndex === -1) {
            if (!pageExists(link)) {
                reportMissing(
                    'missing-page',
                    FILE_EXTENSION.test(link)
                        ? `File link to ${link} does not exist`
                        : `Link to ${link} could not be resolved`,
                    link
                );
            }
        } else {
            // Check if the hash exists in the file, or in the pages a framework redirect
            // page forwards the fragment on to
            const candidates = [linkWithoutPrefix, ...frameworkRedirectLinks(linkWithoutPrefix)];
            if (!candidates.some(hasAnchor)) {
                reportMissing('missing-anchor', `Link to ${originalLink} could not be resolved in`, originalLink);
            }
        }
    });

    const { baselineFile } = options;
    const findings = [...found.values()];

    if (process.env.UPDATE_LINK_BASELINE === 'true' && baselineFile != null) {
        mkdirSync(dirname(baselineFile), { recursive: true });
        writeFileSync(baselineFile, serialiseBaseline(findings));
        console.log(`Link checker baseline rewritten with ${findings.length} known issues: ${baselineFile}`);
        return;
    }

    const baseline =
        baselineFile != null && existsSync(baselineFile)
            ? parseBaseline(readFileSync(baselineFile, 'utf8'))
            : new Set<string>();
    const { fresh, known, stale } = partitionByBaseline(findings, baseline);

    if (known.length) {
        console.log(`Link checker: ${known.length} known issues tolerated by ${baselineFile}.`);
    }
    if (stale.length) {
        console.warn(
            `Link checker: ${stale.length} entries in ${baselineFile} no longer occur and can be removed:\n${stale.join('\n')}`
        );
    }

    const errors = fresh.map((finding) => {
        const error = `${finding.message} (${filePathsString(finding.filePaths, options)})`;
        validationResults[finding.reportKey ?? findingKey(finding)] = { error };
        return error;
    });

    outputJunitReport(validationResults);

    if (errors.length) {
        const baselineHint =
            baselineFile != null
                ? `\nA link that has to stay can be listed in ${baselineFile}; UPDATE_LINK_BASELINE=true rewrites it.`
                : '';
        throw new Error(`
            Invalid links found, please fix the following issues:
            ${errors.join('\n')}${baselineHint}
        `);
    } else {
        console.log('Link checker completed with no issues.');
    }
};

export default function createPlugin({ include, prefix, ...opts }: Options): AstroIntegration {
    return {
        name: 'ag-link-test',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                if (!include) {
                    logger.info('Link checking disabled, skipping');
                    return;
                }
                if (prefix === '/') {
                    prefix = undefined;
                }

                const destDir = fileURLToPath(dir.href);
                const files = findAllFiles(destDir);
                await checkLinks(destDir, files, { include, prefix, ...opts });
            },
        },
    };
}
