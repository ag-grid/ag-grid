import type { Framework } from '@ag-grid-types';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import { type MarkdownFramework, fencedCodeBlock } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { LICENSE_SETUP_COPY, LICENSE_SETUP_HEADINGS } from '@components/license-setup/licenseSetupContent';
import {
    getBootstrapSnippet,
    getDependenciesSnippet,
    getNpmInstallSnippet,
} from '@components/license-setup/utils/getSnippets';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import seedProjects from '../../content/seed-projects/grid-seed-projects.json';

// Placeholder the page shows until a key is pasted, so the snippet reads the same in both.
const LICENSE_PLACEHOLDER = 'YOUR_LICENSE_KEY';

// The page's Integrated Charts toggle starts off, so the snippets below are the plain
// Enterprise ones; the toggle itself needs the page.
const IS_INTEGRATED_CHARTS = false;

// Fence language per framework, matching the languages the on-page Snippet component picks
// (see external/ag-website-shared/src/components/snippet/Snippet.tsx).
const FENCE_LANGUAGE: Record<MarkdownFramework, string> = {
    react: 'jsx',
    javascript: 'js',
    angular: 'ts',
    vue: 'ts',
};

interface SeedProject {
    name: string;
    framework: string;
    devEnvironment: string;
    url: string;
}

/**
 * Build the `licenseSetup` tag as markdown. The tag renders an interactive licence-key tool,
 * but only the paste-a-key field, its validation messages and the Integrated Charts toggle
 * need a browser: the headings, prose, all three snippets and the seed repositories are static
 * once the key is a placeholder, so they are rendered here from the same content module, snippet
 * builders and seed-project data the page uses. The interactive parts link back to the page.
 */
export function buildLicenseSetupMarkdown({
    framework,
    siteRoot,
}: {
    framework: MarkdownFramework;
    siteRoot?: string;
}): string {
    const language = FENCE_LANGUAGE[framework];
    const snippetArgs = { library: 'grid', framework, isIntegratedCharts: IS_INTEGRATED_CHARTS } as const;

    const pageUrl = toAbsoluteUrl(
        urlWithPrefix({ url: './license-install/', framework: framework as Framework }),
        siteRoot
    );
    const { dependenciesLead, npmLead, bootstrapLead, selectingModulesNote, olderVersionNote } = LICENSE_SETUP_COPY;

    const sections = [
        `## ${LICENSE_SETUP_HEADINGS.validate.text}`,
        `[Validate your licence key](${pageUrl}) using the tool on this page.`,
        `### ${LICENSE_SETUP_HEADINGS.configure.text}`,
        `The snippets below are for AG Grid Enterprise without Integrated Charts.` +
            ` [Use the tool on this page](${pageUrl}) to include Integrated Charts.`,
        `### ${LICENSE_SETUP_HEADINGS.dependencies.text}`,
        `${dependenciesLead.before} \`${dependenciesLead.code}\`${dependenciesLead.after}`,
    ];

    const dependenciesSnippet = getDependenciesSnippet(snippetArgs);
    if (dependenciesSnippet) {
        // The page pins this snippet to `json` rather than taking the framework's language.
        sections.push(fencedCodeBlock(dependenciesSnippet, 'json'));
    }

    sections.push(npmLead);

    const npmInstallSnippet = getNpmInstallSnippet(snippetArgs);
    if (npmInstallSnippet) {
        sections.push(fencedCodeBlock(npmInstallSnippet, 'bash'));
    }

    sections.push(`### ${LICENSE_SETUP_HEADINGS.bootstrap.text}`, bootstrapLead);

    const { grid: bootstrapSnippet } = getBootstrapSnippet({
        framework: framework as Framework,
        license: LICENSE_PLACEHOLDER,
        isIntegratedCharts: IS_INTEGRATED_CHARTS,
    });
    if (bootstrapSnippet) {
        sections.push(fencedCodeBlock(bootstrapSnippet, language));
    }

    const modulesUrl = toAbsoluteUrl(
        urlWithPrefix({ url: selectingModulesNote.link.url, framework: framework as Framework }),
        siteRoot
    );
    const umdSentence = framework === 'javascript' ? ` ${selectingModulesNote.javascriptOnly}` : '';
    const archiveUrl = toAbsoluteUrl(urlWithBaseUrl(olderVersionNote.link.url), siteRoot);

    sections.push(
        note(
            `${selectingModulesNote.before} [${selectingModulesNote.link.text}](${modulesUrl})` +
                ` ${selectingModulesNote.after}${umdSentence}`
        ),
        note(`${olderVersionNote.before} [${olderVersionNote.link.text}](${archiveUrl}) ${olderVersionNote.after}`)
    );

    // The page hides the lead and table together when a framework has no seed repositories.
    const seedRepos = seedReposTable(framework);
    if (seedRepos) {
        sections.push(`## ${LICENSE_SETUP_HEADINGS.seedRepos.text}`, LICENSE_SETUP_COPY.seedReposLead, seedRepos);
    }

    return sections.join('\n\n');
}

/** The seed repositories for this framework, as the page's table (it filters by framework too). */
function seedReposTable(framework: MarkdownFramework): string {
    const rows = (seedProjects as SeedProject[])
        .filter((project) => project.framework === framework)
        .map((project) => [`[${project.name}](${project.url})`, project.framework, project.devEnvironment]);
    return markdownTable(LICENSE_SETUP_COPY.seedReposHeaders, rows);
}

// Matches how the serializer renders an mdoc `{% note %}` block.
function note(text: string): string {
    return `> **Note**\n>\n> ${text}`;
}
