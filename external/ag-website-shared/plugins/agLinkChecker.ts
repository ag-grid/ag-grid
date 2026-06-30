import junitProcessor from 'ag-shared/processor';
import type { AstroIntegration } from 'astro';
import fs, { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';

const { TestSuites, TestSuite, TestCase } = junitProcessor;

type Options = {
    include: boolean;
    prefix?: string;
};

const IGNORED_PATHS = ['/archive'];
const HREF_PATTERNS_TO_IGNORE = [
    '?', // Links with queries
    '#reference-', // API references, as they are rendered client side
    '#example-', // Example references, as they aren't headings
    '#contact-section', // Contact form on about page
];

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
    const { prefix } = options;

    for (let i = 0; i < files.length; i++) {
        const filePath = files[i];
        if (!filePath.endsWith('index.html') || filePath.startsWith('example')) {
            // don't search non-html files, or example files.
            continue;
        }

        const thisFileUrl = filePathToUrl(filePath);

        const recordUsage = (href: string) => {
            // Query links and anchors injected client-side (API/example
            // references, the about-page contact form) have no static target
            // to resolve against.
            if (HREF_PATTERNS_TO_IGNORE.some((pattern) => href.includes(pattern))) {
                return;
            }
            // An empty fragment (#) or #top both scroll to the top of the page;
            // they always resolve and have no target element to check against.
            const hashIndex = href.indexOf('#');
            if (hashIndex !== -1) {
                const fragment = href.slice(hashIndex + 1);
                if (fragment === '' || fragment.toLowerCase() === 'top') {
                    return;
                }
            }
            // Same-page (#foo) links resolve against this page; absolute
            // (/page#foo) links resolve against another page. Anything else
            // (external, relative) is left to the file-existence checks below.
            let link: string | undefined;
            if (href.startsWith('#')) {
                link = `${thisFileUrl}${href}`;
                // A page linking to its own anchor also marks that anchor as a
                // valid target, covering headings rendered by client-only
                // components (e.g. the licence-install steps).
                anchors.add(link);
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
                    recordUsage(hrefMatch[2]);
                }
            }
        };

        // Stream the file rather than reading it whole (large files caused OOM
        // crashes). We accumulate one tag at a time, from '<' to '>', and
        // process it the moment it closes. The accumulator state lives outside
        // the chunk loop so a tag straddling a chunk boundary isn't dropped.
        const fileStream = fs.createReadStream(join(dir, filePath), { encoding: 'utf8' });
        let inTag = false;
        let tag = '';
        for await (const chunk of fileStream) {
            const strChunk = chunk as string;
            for (let i = 0, len = strChunk.length; i < len; ++i) {
                const chr = strChunk[i];
                if (inTag) {
                    if (chr === '>') {
                        inTag = false;
                        processTag(tag);
                        tag = '';
                    } else {
                        tag += chr;
                    }
                } else if (chr === '<') {
                    inTag = true;
                    tag = '';
                }
            }
        }
    }

    // for junit reporting
    const validationResults = {};

    const errors: string[] = [];
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
        if (!link.includes('#')) {
            // if this is a file, do direct lookup in files list
            const fileExtRegex = /\.[a-zA-Z]+$/;
            if (fileExtRegex.test(link)) {
                if (!files.includes(link)) {
                    const error = `File link to ${link} does not exist.`;
                    errors.push(error);

                    validationResults[link] = { error };
                }
                return;
            }

            // if this is a directory, check for index.html
            const dirHtml = `${!link || link.endsWith('/') ? link : `${link}/`}index.html`;
            if (files.includes(dirHtml)) {
                return;
            }

            // might be a html file itself...
            if (files.includes(`${link.endsWith('/') ? link.slice(0, -1) : link}.html`)) {
                return;
            }

            const error = `Link to ${link} could not be resolved (${filePathsString(filePaths, options)}).`;
            errors.push(error);

            validationResults[link] = { error };
            return;
        } else {
            // Check if the hash exists in the file
            if (!anchors.has(linkWithoutPrefix) && !anchors.has(linkWithoutPrefix.replace('#', '/#'))) {
                errors.push(
                    `Link to ${originalLink} could not be resolved in (${filePathsString(filePaths, options)}).`
                );
            }
        }
    });

    outputJunitReport(validationResults);

    if (errors.length) {
        throw new Error(`
            Invalid links found, please fix the following issues:
            ${errors.join('\n')}
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
