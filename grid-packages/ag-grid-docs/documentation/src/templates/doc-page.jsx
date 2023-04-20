import classnames from 'classnames';
import { ApiDocumentation, InterfaceDocumentation } from 'components/ApiDocumentation';
import ChartGallery from 'components/chart-gallery/ChartGallery';
import ChartsApiExplorer from 'components/charts-api-explorer/ChartsApiExplorer';
import ExampleRunner from 'components/example-runner/ExampleRunner';
import { ExpandableSnippet } from 'components/expandable-snippet/ExpandableSnippet';
import FrameworkSpecificSection from 'components/FrameworkSpecificSection';
import Gif from 'components/Gif';
import { Icon } from 'components/Icon';
import IconsPanel from 'components/IconsPanel';
import ImageCaption from 'components/ImageCaption';
import MatrixTable from 'components/MatrixTable';
import Note from 'components/Note';
import { OpenInCTA } from 'components/OpenInCTA';
import { SEO } from 'components/SEO';
import SideMenu from 'components/SideMenu';
import { Snippet } from 'components/snippet/Snippet';
import { Tabs } from 'components/tabs/Tabs';
import VideoSection from 'components/VideoSection';
import Warning from 'components/Warning';
import { graphql } from 'gatsby';
import React, { useState } from 'react';
import rehypeReact from 'rehype-react';
import { getProductType } from 'utils/page-header';
import stripHtml from 'utils/strip-html';
import DocumentationLink from '../components/DocumentationLink';
import LearningVideos from '../components/LearningVideos';
import { TabsLinks } from '../components/tabs/TabsLinks';
import { AGStyles } from './ag-styles';
import styles from './doc-page.module.scss';

/**
 * This template is used for documentation pages, i.e. those generated from Markdown files.
 */
const DocPageTemplate = ({ data, pageContext: { framework, exampleIndexData, pageName } }) => {
    const { markdownRemark: page } = data;
    const [showSideMenu, setShowSideMenu] = useState(
        page.frontmatter.sideMenu === null ? true : page.frontmatter.sideMenu
    );

    if (!page) {
        return null;
    }

    const ast = page.htmlAst;

    const getExampleRunnerProps = (props, library) => ({
        ...props,
        framework,
        pageName,
        library,
        exampleIndexData,
        options: props.options != null ? JSON.parse(props.options) : undefined,
    });

    // This configures which components will be used for the specified HTML tags
    const renderAst = new rehypeReact({
        createElement: React.createElement,
        components: {
            a: (props) => DocumentationLink({ ...props, framework }),
            gif: (props) =>
                Gif({ ...props, pageName, autoPlay: props.autoPlay != null ? JSON.parse(props.autoPlay) : false }),
            'grid-example': (props) => (
                <AGStyles hasFontSizeResponsive={false}>
                    <ExampleRunner {...getExampleRunnerProps(props, 'grid')} />
                </AGStyles>
            ),
            'chart-example': (props) => (
                <AGStyles hasFontSizeResponsive={false}>
                    <ExampleRunner {...getExampleRunnerProps(props, 'charts')} />
                </AGStyles>
            ),
            'api-documentation': (props) =>
                ApiDocumentation({
                    ...props,
                    pageName,
                    framework,
                    exampleIndexData,
                    sources: props.sources != null ? JSON.parse(props.sources) : undefined,
                    config: props.config != null ? JSON.parse(props.config) : undefined,
                }),
            'interface-documentation': (props) =>
                InterfaceDocumentation({
                    ...props,
                    framework,
                    exampleIndexData,
                    config: props.config != null ? JSON.parse(props.config) : undefined,
                }),
            snippet: (props) => Snippet({ ...props, framework }),
            'expandable-snippet': (props) =>
                ExpandableSnippet({
                    ...props,
                    framework,
                    exampleIndexData,
                    breadcrumbs: props.breadcrumbs ? JSON.parse(props.breadcrumbs) : undefined,
                    config: props.config != null ? JSON.parse(props.config) : undefined,
                }),
            'icons-panel': (props) => (
                <AGStyles hasFontSizeResponsive={false}>
                    <IconsPanel {...props} />
                </AGStyles>
            ),
            'image-caption': (props) => ImageCaption({ ...props, pageName }),
            'matrix-table': (props) => MatrixTable({ ...props, framework, exampleIndexData }),
            tabs: (props) => (
                <AGStyles hasFontSizeResponsive={false}>
                    <Tabs {...props} />
                </AGStyles>
            ),
            'tabs-links': TabsLinks,
            'learning-videos': (props) => LearningVideos({ framework }),
            'video-section': VideoSection,
            note: Note,
            warning: Warning,
            'framework-specific-section': (props) =>
                FrameworkSpecificSection({ ...props, currentFramework: framework }),
            'chart-gallery': (props) => (
                <AGStyles hasFontSizeResponsive={false}>
                    <ChartGallery {...props} />
                </AGStyles>
            ),
            'charts-api-explorer': (props) => (
                <AGStyles hasFontSizeResponsive={false}>
                    <ChartsApiExplorer {...props} framework={framework} exampleIndexData={exampleIndexData} />
                </AGStyles>
            ),
            'open-in-cta': OpenInCTA,

            // AG Styles wrapper - wrap markdown -> html elements with `.ag-styles` to apply the new design system.
            // Can be removed when the new design system is applied to everything
            h1: ({ children, ...otherProps }) => (
                <AGStyles>
                    <h1 {...otherProps}>{children}</h1>
                </AGStyles>
            ),
            h2: ({ children, ...otherProps }) => (
                <AGStyles>
                    <h2 {...otherProps}>{children}</h2>
                </AGStyles>
            ),
            h3: ({ children, ...otherProps }) => (
                <AGStyles>
                    <h3 {...otherProps}>{children}</h3>
                </AGStyles>
            ),
            h4: ({ children, ...otherProps }) => (
                <AGStyles>
                    <h4 {...otherProps}>{children}</h4>
                </AGStyles>
            ),
            h5: ({ children, ...otherProps }) => (
                <AGStyles>
                    <h5 {...otherProps}>{children}</h5>
                </AGStyles>
            ),
            h6: ({ children, ...otherProps }) => (
                <AGStyles>
                    <h6 {...otherProps}>{children}</h6>
                </AGStyles>
            ),
            p: ({ children, ...otherProps }) => (
                <AGStyles>
                    <p {...otherProps}>{children}</p>
                </AGStyles>
            ),
            ul: ({ children, ...otherProps }) => (
                <AGStyles>
                    <ul {...otherProps}>{children}</ul>
                </AGStyles>
            ),
            ol: ({ children, ...otherProps }) => (
                <AGStyles>
                    <ol {...otherProps}>{children}</ol>
                </AGStyles>
            ),
            table: ({ children, ...otherProps }) => (
                <AGStyles>
                    <table {...otherProps}>{children}</table>
                </AGStyles>
            ),
            pre: ({ children, className, ...otherProps }) => (
                <AGStyles>
                    <pre className={classnames('code', className)} {...otherProps}>
                        {children}
                    </pre>
                </AGStyles>
            ),
            hr: ({ children, ...otherProps }) => (
                <AGStyles>
                    <hr {...otherProps}>{children}</hr>
                </AGStyles>
            ),
        },
    }).Compiler;

    let { title, description, version } = page.frontmatter;

    version = version ? ` ${version}` : '';

    if (!description) {
        // If no description is provided in the Markdown, we create one from the lead paragraph
        const firstParagraphNode = ast.children.filter((child) => child.tagName === 'p')[0];

        if (firstParagraphNode) {
            description = stripHtml(firstParagraphNode);
        }
    }

    // solidjs is still tactical and "lives" under react - make a bit of an exception here so the title makes sense
    const pageTitle = (
        <>
            {pageName === 'solidjs' ? (
                <span className={styles.headerFramework}>SolidJS Data Grid:</span>
            ) : (
                <span className={styles.headerFramework}>
                    {getProductType(framework, pageName.startsWith('charts-'), version)}
                </span>
            )}
            <span>{title}</span>
        </>
    );

    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames(styles['doc-page'], { [styles.noSideMenu]: !showSideMenu })}>
                {/*eslint-disable-next-line react/jsx-pascal-case*/}
                <SEO title={title} description={description} framework={framework} pageName={pageName} />
                <AGStyles>
                    <header className={styles.docsPageHeader}>
                        <h1 id="top" className={styles.docsPageTitle}>
                            {pageTitle}
                            {page.frontmatter.enterprise && (
                                <span className={styles.enterpriseLabel}>
                                    Enterprise
                                    <Icon name="enterprise" />
                                </span>
                            )}
                        </h1>
                    </header>
                </AGStyles>

                {/* Wrapping div is a hack to target "intro" section of docs page */}
                <div className={styles.pageSections}>{renderAst(ast)}</div>
            </div>

            {showSideMenu && (
                <SideMenu
                    headings={page.headings || []}
                    pageName={pageName}
                    pageTitle={title}
                    hideMenu={() => setShowSideMenu(false)}
                />
            )}
        </div>
    );
};

export const pageQuery = graphql`
    query DocPageByPath($srcPath: String!) {
        markdownRemark(fields: { path: { eq: $srcPath } }) {
            htmlAst
            frontmatter {
                title
                version
                enterprise
                sideMenu
                description
            }
            headings {
                id
                depth
                value
            }
        }
    }
`;

export default DocPageTemplate;
