import type { Framework, Library } from '@ag-grid-types';
import featuresData from '@ag-website-shared/components/features-section/DocsFeaturesSection.json';
import whatsNewData from '@ag-website-shared/content/whats-new/data.json';
import type { MarkdownFramework } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { getDocumentationArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';
import { getChangelogUrl } from '@ag-website-shared/utils/getChangelogUrl';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { getExamplesPath } from '@components/docs/utils/filesData';
import { ICON_NAMES, ICON_THEMES } from '@components/icon/iconsData';
import type { MatrixDatum } from '@components/matrix-table/utils/matrixData';
import { agLibraryVersion } from '@constants';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import { type CollectionEntry, getEntry } from 'astro:content';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import gridSeedProjects from '../../content/seed-projects/grid-seed-projects.json';
import { markdownTable } from './markdownTable';
import { type VersionEntry, buildMajorTable } from './renderMajorTable';
import { buildMatrixTable } from './renderMatrixTable';
import { type ModuleNode, buildModuleMappingsTable } from './renderModuleMappings';
import { toAbsoluteUrl } from './toAbsoluteUrl';

// Source of truth: FigmaCommunityButton.astro. A stable community-file URL.
const FIGMA_DESIGN_SYSTEM_URL = 'https://www.figma.com/community/file/1360600846643230092/ag-grid-design-system';

interface RenderMarkdocTagParams {
    tag: string;
    attributes: Record<string, any>;
    framework: MarkdownFramework;
    pageName: string;
    siteRoot?: string;
}

/**
 * Grid dispatch for the Markdoc tags the shared serializer delegates via its
 * `renderTag` resolver — the content-bearing tags with no built-in handler.
 * Returns `null` for anything unknown so the serializer falls back to rendering
 * the tag's children. Never throws: a failed tag degrades to '' with a warning,
 * matching renderApiReferenceTable.
 */
export async function renderMarkdocTag(params: RenderMarkdocTagParams): Promise<string | null> {
    const { tag, attributes, framework, pageName, siteRoot } = params;
    try {
        switch (tag) {
            case 'matrixTable':
                return await renderMatrixTable(attributes);
            case 'moduleMappings':
                return await renderModuleMappings(framework, siteRoot);
            case 'majorTable':
                return await renderMajorTable(attributes, framework, siteRoot);
            case 'seedProjectsTable':
                return renderSeedProjectsTable(siteRoot);
            case 'embedSnippet':
                return renderEmbedSnippet(attributes, pageName);
            case 'changelogSection':
                return renderChangelogSection(attributes);
            case 'documentationArchiveSection':
                return renderDocumentationArchiveSection(attributes);
            case 'figmaCommunityButton':
                return `[AG Grid Design System (Figma)](${FIGMA_DESIGN_SYSTEM_URL})`;
            case 'openInCTA':
                return renderOpenInCTA(attributes);
            case 'iframe':
                return attributes.src ? `[Embedded content](${attributes.src})` : '';
            case 'learningVideos':
                return renderLearningVideos(framework);
            case 'featuresSection':
                return renderFeaturesSection(attributes, framework, siteRoot);
            case 'iconsPanel':
                return renderIconsPanel(siteRoot);
            default:
                return null;
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`renderMarkdocTag: failed to render <${tag}> — ${(error as Error)?.message ?? error}`);
        return '';
    }
}

async function renderMatrixTable(attributes: Record<string, any>): Promise<string> {
    if (!attributes.dataFileName) {
        return '';
    }
    const entry = (await getEntry('matrixTable', attributes.dataFileName)) as
        | CollectionEntry<'matrixTable'>
        | undefined;
    if (!entry) {
        return '';
    }
    return buildMatrixTable(entry.data as MatrixDatum[], attributes);
}

async function renderModuleMappings(framework: MarkdownFramework, siteRoot?: string): Promise<string> {
    const entry = (await getEntry('moduleMappings', 'modules')) as CollectionEntry<'moduleMappings'> | undefined;
    if (!entry) {
        return '';
    }
    const groups = (entry.data as { groups: ModuleNode[] }).groups ?? [];
    return buildModuleMappingsTable(groups, framework, siteRoot);
}

async function renderMajorTable(
    attributes: Record<string, any>,
    framework: MarkdownFramework,
    siteRoot?: string
): Promise<string> {
    const library = attributes.library ?? 'grid';
    const entry = (await getEntry('versions', `ag-${library}-versions`)) as CollectionEntry<'versions'> | undefined;
    if (!entry) {
        return '';
    }
    return buildMajorTable(entry.data as VersionEntry[], attributes, framework, siteRoot);
}

function renderSeedProjectsTable(siteRoot?: string): string {
    const pricingUrl = toAbsoluteUrl('/license-pricing/', siteRoot);
    const rows = (gridSeedProjects as any[]).map((project) => {
        const licenseLabel = project.licenseType === 'enterprise-bundle' ? 'Enterprise Bundle' : 'AG Grid Enterprise';
        return [
            `[${project.name}](${project.url})`,
            project.framework,
            project.devEnvironment,
            `[${licenseLabel}](${pricingUrl})`,
        ];
    });
    return markdownTable(['GitHub Repo', 'Framework', 'Dev Environment', 'License Type'], rows);
}

function renderEmbedSnippet(attributes: Record<string, any>, pageName: string): string {
    // Only the on-disk `src` branch is reproducible at build time; the `url` branch
    // fetches a remote snippet client-side and is dropped.
    if (!attributes.src) {
        return '';
    }
    const examplePath = getExamplesPath({ pageName });
    const file = path.join(examplePath, String(attributes.src));
    const code = readFileSync(file).toString().replace(/\n$/, '');
    const language = attributes.language ? String(attributes.language) : '';
    return `\`\`\`${language}\n${code}\n\`\`\``;
}

function renderChangelogSection(attributes: Record<string, any>): string {
    const version = String(attributes.version ?? '');
    const site = (attributes.site ?? 'grid') as Library;
    if (!version) {
        return '';
    }
    const url = getChangelogUrl({ site, version });
    return `## Changes List\n\n[See the full changelog for v${version}](${url})`;
}

function renderDocumentationArchiveSection(attributes: Record<string, any>): string {
    const version = String(attributes.version ?? '');
    const site = (attributes.site ?? 'grid') as Library;
    if (!version) {
        return '';
    }
    const { major, minor } = parseVersion(version);
    const current = parseVersion(agLibraryVersion);
    // Matches DocumentationArchiveSection.astro: nothing to show for the current major/minor.
    if (major === current.major && minor === current.minor) {
        return '';
    }
    const name = (whatsNewData as Record<string, { name: string }>)[site]?.name ?? 'AG Grid';
    const url = getDocumentationArchiveUrl({ site, version });
    return `## Documentation\n\n[See ${name} ${major}.${minor} Documentation](${url})`;
}

function renderOpenInCTA(attributes: Record<string, any>): string {
    const href = String(attributes.href ?? '');
    if (!href) {
        return '';
    }
    const text = attributes.text ? String(attributes.text) : 'Open example';
    return `[${text}](${href})`;
}

interface VideoData {
    title: string;
    url: string;
    runningTime?: string;
}

function renderLearningVideos(framework: MarkdownFramework): string {
    const file = path.join(process.cwd(), 'public', 'videos', 'videos.json');
    const byFramework = JSON.parse(readFileSync(file).toString()) as Record<string, VideoData[]>;
    const videos = byFramework[framework] ?? [];
    if (videos.length === 0) {
        return '';
    }
    return videos
        .map((video) => `- [${video.title}](${video.url})${video.runningTime ? ` (${video.runningTime})` : ''}`)
        .join('\n');
}

interface FeatureItem {
    title: string;
    description: string;
    link?: string;
}

function renderFeaturesSection(
    attributes: Record<string, any>,
    framework: MarkdownFramework,
    siteRoot?: string
): string {
    const library = String(attributes.library ?? 'grid');
    const type = String(attributes.type ?? '');
    const features: FeatureItem[] = (featuresData as any)?.[library]?.[type] ?? [];
    if (features.length === 0) {
        return '';
    }
    return features
        .map((feature) => {
            const title = feature.link
                ? `[${feature.title}](${toAbsoluteUrl(urlWithPrefix({ url: feature.link, framework: framework as Framework }), siteRoot)})`
                : feature.title;
            return `- **${title}** — ${feature.description}`;
        })
        .join('\n');
}

function renderIconsPanel(siteRoot?: string): string {
    const iconList = ICON_NAMES.map((name) => `\`${name}\``).join(', ');
    const downloads = ICON_THEMES.map((theme) => {
        const label = theme.charAt(0).toUpperCase() + theme.slice(1);
        const url = toAbsoluteUrl(`/theme-icons/${theme}/${theme}-icons.zip`, siteRoot);
        return `[${label}](${url})`;
    }).join(', ');
    return [`Available icons: ${iconList}`, `Download icon sets: ${downloads}`].join('\n\n');
}
