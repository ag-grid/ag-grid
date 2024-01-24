import { Markdoc, component, defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';

// import { DOCS_TAB_ITEM_ID_PREFIX } from './src/constants';

export default defineMarkdocConfig({
    nodes: {
        heading: {
            ...nodes.heading, // Preserve default anchor link generation
            render: component('./src/components/Heading.astro'),
        },
        link: {
            ...nodes.link,
            render: component('./src/components/Link.astro'),
        },
        fence: {
            attributes: {
                ...Markdoc.nodes.fence.attributes!,
                transform: Boolean,
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
        //     /**
        //      * External link that opens in a new tab
        //      */
        //     externalLink: {
        //         render: component('./src/components/ExternalLink.astro'),
        //         attributes: {
        //             href: { type: String, required: true },
        //         },
        //     },
        enterpriseIcon: {
            render: component('./src/components/icon/EnterpriseIcon.astro'),
        },
        //     chartExampleRunner: {
        //         render: component('./src/features/docs/components/DocsExampleRunner.astro'),
        //         attributes: {
        //             title: { type: String, required: true },
        //             name: { type: String, required: true },
        //             type: { type: String },
        //             options: { type: Object },
        //         },
        //     },
        //     featureComparator: {
        //         render: component('./src/components/featureComparator/FeatureComparator.astro'),
        //     },
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
        //     apiReference: {
        //         render: component('./src/features/api-documentation/ApiReference.astro'),
        //         attributes: {
        //             id: { type: 'String' },
        //             include: { type: 'Array' },
        //             exclude: { type: 'Array' },
        //             prioritise: { type: 'Array' },
        //             hideHeader: { type: 'Boolean' },
        //             hideRequired: { type: 'Boolean' },
        //             specialTypes: { type: 'Object' },
        //         },
        //     },
        //     tabs: {
        //         render: component('./src/components/tabs/TabsWithHtmlChildren.astro'),
        //         attributes: {
        //             omitFromOverview: { type: Boolean, default: false },
        //             tabItemIdPrefix: {
        //                 type: String,
        //                 default: DOCS_TAB_ITEM_ID_PREFIX,
        //             },
        //         },
        //     },
        //     tabItem: {
        //         render: component('./src/components/tabs/TabHtmlContent', 'TabHtmlContent'),
        //         attributes: {
        //             id: { type: String },
        //             label: { type: String },
        //         },
        //     },
        videoSection: {
            render: component('./src/components/video-section/VideoSection.astro'),
            attributes: {
                id: { type: String },
                title: { type: String },
                showHeader: { type: Boolean },
            },
        },
    },
});
