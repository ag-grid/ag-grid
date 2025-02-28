import { isFramework } from '@ag-website-shared/markdoc/functions/isFramework';
import { isNotJavascriptFramework } from '@ag-website-shared/markdoc/functions/isNotJavascriptFramework';
import { getMigrationVersionPatch, migrationVersion } from '@ag-website-shared/markdoc/functions/migrationVersion';
import { heading } from '@ag-website-shared/markdoc/nodes/heading';
import { br } from '@ag-website-shared/markdoc/tags/br';
import { embedSnippet } from '@ag-website-shared/markdoc/tags/embedSnippet';
import { enterpriseIcon } from '@ag-website-shared/markdoc/tags/enterpriseIcon';
import { expandingSection } from '@ag-website-shared/markdoc/tags/expandingSection';
import { featuresSection } from '@ag-website-shared/markdoc/tags/featuresSection';
import { getChangelogSection } from '@ag-website-shared/markdoc/tags/getChangelogSection';
import { getDocumentationArchiveSection } from '@ag-website-shared/markdoc/tags/getDocumentationArchiveSection';
import { gettingStarted } from '@ag-website-shared/markdoc/tags/getting-started';
import { idea } from '@ag-website-shared/markdoc/tags/idea';
import { image } from '@ag-website-shared/markdoc/tags/image';
import { imageCaption } from '@ag-website-shared/markdoc/tags/imageCaption';
import { kbd } from '@ag-website-shared/markdoc/tags/kbd';
import { note } from '@ag-website-shared/markdoc/tags/note';
import { oneTrustCookies } from '@ag-website-shared/markdoc/tags/oneTrustCookies';
import { openInCTA } from '@ag-website-shared/markdoc/tags/openInCTA';
import { tabItem, tabs } from '@ag-website-shared/markdoc/tags/tabs';
import { trialLicenceForm } from '@ag-website-shared/markdoc/tags/trialLicenceForm';
import { video } from '@ag-website-shared/markdoc/tags/video';
import { videoSection } from '@ag-website-shared/markdoc/tags/videoSection';
import { warning } from '@ag-website-shared/markdoc/tags/warning';
import { Markdoc, component, defineMarkdocConfig } from '@astrojs/markdoc/config';
import {
    chartsVersion,
    chartsVersionPatch,
    gridVersion,
    gridVersionPatch,
} from '@utils/markdoc/functions/libraryVersions';
import { getFrameworkCapitalised } from '@utils/markdoc/getFrameworkCapitalised';

import { agChartsVersion, agGridVersion } from './src/constants';
import versionsData from './src/content/versions/ag-grid-versions.json';
import { link } from './src/utils/markdoc/tags/link';

export default defineMarkdocConfig({
    variables: {
        agGridVersion,
        agChartsVersion,
    },
    nodes: {
        heading,
        link,
        fence: {
            attributes: {
                ...Markdoc.nodes.fence.attributes!,
                /**
                 * Determine if snippet component is used or not
                 *
                 * Snippets transform the code based on the user selected framework
                 */
                frameworkTransform: Boolean,
                language: String,
                lineNumbers: Boolean,
                suppressFrameworkContext: Boolean,
                spaceBetweenProperties: Boolean,
                inlineReactProperties: Boolean,
            } as any,
            render: component('./src/components/snippet/Snippet.astro'),
        },
    },
    functions: {
        isFramework,
        isNotJavascriptFramework,
        getFrameworkCapitalised,
        migrationVersion,
        migrationVersionPatch: getMigrationVersionPatch(versionsData),
        gridVersion,
        gridVersionPatch,
        chartsVersion,
        chartsVersionPatch,
    },
    tags: {
        kbd,
        link,
        oneTrustCookies,
        tabs,
        tabItem,
        videoSection,
        image,
        br,
        note,
        warning,
        idea,
        openInCTA,
        expandingSection,
        documentationArchiveSection: getDocumentationArchiveSection('grid'),
        changelogSection: getChangelogSection('grid'),
        trialLicenceForm,
        enterpriseIcon,
        video,
        gettingStarted,
        featuresSection,
        licenseSetup: {
            render: component('./src/components/license-setup/components/LicenseSetup.astro'),
        },
        gridExampleRunner: {
            render: component('./src/components/docs/components/DocsExampleRunner.astro'),
            attributes: {
                title: { type: String, required: true },
                name: { type: String, required: true },
                typescriptOnly: { type: Boolean },
                suppressDarkMode: { type: Boolean },
                exampleHeight: { type: Number },
            },
        },
        apiDocumentation: {
            render: component('./src/components/reference-documentation/components/ApiDocumentation.astro'),
            attributes: {
                source: { type: String },
                sources: { type: Array },
                section: { type: String },
                names: { type: Array },
                config: { type: Object },

                // For `getHeadings` parsing
                __apiDocumentationHeadings: { type: Boolean },
            },
        },
        interfaceDocumentation: {
            render: component('./src/components/reference-documentation/components/InterfaceDocumentation.astro'),
            attributes: {
                interfaceName: { type: String, required: true },
                overrideSrc: { type: String },
                names: { type: Array },
                exclude: { type: Array },
                config: { type: Object },
            },
        },
        matrixTable: {
            render: component('./src/components/matrix-table/components/MatrixTable.astro'),
            attributes: {
                /**
                 * Data file name within `src/content/matrix-table`
                 *
                 * Excluding the extension
                 */
                dataFileName: { type: String },
                /**
                 * Mapping of column keys to the displayed column name and order
                 */
                columns: { type: Object, required: true },
                /**
                 * Filter condition for filtering row data, as a string
                 *
                 * NOTE: Only supports simple field key matches, `!key`, `&&` and `||` cases
                 */
                filter: { type: String },
                /**
                 * Cell renderer to use for the column fields
                 */
                cellRenderer: { type: Object },
            },
        },
        gif: {
            render: component('./src/components/image/Gif.astro'),
            attributes: {
                imagePath: { type: String, required: true },
                alt: { type: String, required: true },
                autoPlay: { type: Boolean },
                wrapped: { type: Boolean },
            },
        },
        embedSnippet,
        iframe: {
            render: 'iframe',
            attributes: {
                src: { type: String, required: true },
                style: { type: String },
            },
        },
        iconsPanel: {
            render: component('./src/components/icon/IconsPanel.astro'),
        },
        imageCaption,
        flex: {
            render: component('./src/components/flex/Flex.astro'),
            attributes: {
                direction: { type: String, matches: ['row', 'column'] },
                alignItems: {
                    type: String,
                    matches: ['center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end'],
                },
                justifyContent: {
                    type: String,
                    matches: ['center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end'],
                },
                gap: {
                    type: String,
                    matches: ['size-6', 'size-10'],
                },
                mobileWrap: {
                    type: Boolean,
                },
            },
        },
        learningVideos: {
            render: component('./src/components/learning-videos/LearningVideos.astro'),
            attributes: {
                id: { type: String },
                title: { type: String },
                showHeader: { type: Boolean },
            },
        },
        figmaCommunityButton: {
            render: component('./src/components/figma-community-button/FigmaCommunityButton.astro'),
        },
        metaTag: {
            render: component('./src/components/docs/components/MetaTagComponent.astro'),
            attributes: {
                tags: { type: Array, required: true },
            },
        },
        seedProjectsTable: {
            render: component('./src/components/SeedProjectsTable.astro'),
        },
        moduleMappings: {
            render: component('./src/components/module-mappings/ModuleMappings.astro'),
        },
    },
});
