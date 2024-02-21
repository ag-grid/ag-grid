import { Markdoc, component, defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import { DOCS_TAB_ITEM_ID_PREFIX } from './src/constants';

export default defineMarkdocConfig({
    nodes: {
        heading: {
            ...nodes.heading, // Preserve default anchor link generation
            render: component('./src/components/Heading.astro'),
        },
        link: {
            ...nodes.link,
            /**
             * Transform markdoc links to add url prefix and framework to href
             */
            transform(node, config) {
                const { framework } = config.variables;
                const children = node.transformChildren(config);
                const nodeAttributes = node.transformAttributes(config);
                const href = urlWithPrefix({ url: nodeAttributes.href, framework });
                const attributes = {
                    ...nodeAttributes,
                    href,
                };

                return new Markdoc.Tag('a', attributes, children);
            },
        },
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

                // TODO: Temporary for mdx migration
                fixme: Boolean,
            } as any,
            render: component('./src/components/snippet/Snippet.astro'),
        },
    },
    functions: {
        isFramework: {
            transform(parameters, context) {
                const pageFramework = context.variables?.framework;
                return Object.values(parameters).includes(pageFramework);
            },
        },
        isNotJavascriptFramework: {
            transform(_, context) {
                const pageFramework = context.variables?.framework;
                return pageFramework !== 'javascript';
            },
        },
    },
    tags: {
        kbd: {
            render: 'kbd',
            attributes: {
                primary: { type: String },
            },
            transform(node) {
                return new Markdoc.Tag(this.render, {}, [node.attributes.primary]);
            },
        },
        br: {
            render: 'br',
        },
        /**
         * External link that opens in a new tab
         */
        externalLink: {
            render: component('./src/components/ExternalLink.astro'),
            attributes: {
                href: { type: String, required: true },
            },
        },
        enterpriseIcon: {
            render: component('./src/components/icon/EnterpriseIcon', 'EnterpriseIcon'),
        },
        // TODO: Implement
        gridExampleRunner: {
            render: component('./src/features/docs/components/DocsExampleRunner.astro'),
            attributes: {
                title: { type: String, required: true },
                name: { type: String, required: true },
                type: { type: String },
                options: { type: Object },
            },
        },
        // TODO: Implement
        apiDocumentation: {
            render: 'pre',
            attributes: {
                source: { type: String, required: true },
                section: { type: String },
                names: { type: Array },
                config: { type: Object },
            },
        },
        // TODO: Implement
        interfaceDocumentation: {
            render: component('./src/components/reference-documentation/InterfaceDocumentation.astro'),
            attributes: {
                interfaceName: { type: String, required: true },
                overrideSrc: { type: String },
                names: { type: Array },
                exclude: { type: Array },
                wrapNamesAt: { type: Number },
                config: { type: Object },
            },
        },
        matrixTable: {
            render: component('./src/features/matrixTable/components/MatrixTable.astro'),
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
        note: {
            render: component('./src/components/alert/Note'),
        },
        warning: {
            render: component('./src/components/alert/Warning'),
        },
        idea: {
            render: component('./src/components/alert/Idea'),
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
        iconsPanel: {
            render: component('./src/components/icon/IconsPanel.astro'),
        },
        downloadDSButton: {
            render: component('./src/components/download-ds-button/DownloadDSButton.astro'),
        },
        image: {
            render: component('./src/components/image/Image.astro'),
            attributes: {
                /**
                 * Docs page name in `src/content/[pageName]
                 *
                 * If not provided, will default to the location of the markdoc file
                 */
                pageName: { type: String },
                imagePath: { type: String, required: true },
                alt: { type: String, required: true },
                width: { type: String },
                height: { type: String },
                minWidth: { type: String },
                maxWidth: { type: String },
                margin: { type: String },
            },
        },
        imageCaption: {
            render: component('./src/components/image/ImageCaption.astro'),
            attributes: {
                /**
                 * Docs page name in `src/content/[pageName]
                 *
                 * If not provided, will default to the location of the markdoc file
                 */
                pageName: { type: String },
                /**
                 * Relative path within markdoc page folder
                 */
                imagePath: { type: String, required: true },
                alt: { type: String, required: true },
                centered: { type: Boolean },
                constrained: { type: Boolean },
                descriptionTop: { type: Boolean },
                width: { type: String },
                height: { type: String },
                minWidth: { type: String },
                maxWidth: { type: String },
                /**
                 * Enable dark mode CSS filter for image
                 *
                 * Alternatively, add `-dark` suffixed image in `imagePath` to add
                 * dark mode image manually
                 */
                enableDarkModeFilter: { type: Boolean },
                /**
                 * Autoplay gif
                 */
                autoPlay: { type: Boolean },
            },
        },
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
            },
        },
        tabs: {
            render: component('./src/components/tabs/TabsWithHtmlChildren.astro'),
            attributes: {
                omitFromOverview: { type: Boolean, default: false },
                tabItemIdPrefix: {
                    type: String,
                    default: DOCS_TAB_ITEM_ID_PREFIX,
                },
                headerLinks: {
                    type: Array,
                },
            },
        },
        tabItem: {
            render: component('./src/components/tabs/TabHtmlContent', 'TabHtmlContent'),
            attributes: {
                id: { type: String, required: true },
                label: { type: String },
            },
        },
        videoSection: {
            render: component('./src/components/video-section/VideoSection.astro'),
            attributes: {
                id: { type: String },
                title: { type: String },
                showHeader: { type: Boolean },
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
    },
});
