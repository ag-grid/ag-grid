import React, {useState} from 'react';
import {graphql} from 'gatsby';
import rehypeReact from 'rehype-react';
import classnames from 'classnames';
import ExampleRunner from 'components/example-runner/ExampleRunner';
import SideMenu from 'components/SideMenu';
import processFrameworkSpecificSections from 'utils/framework-specific-sections';
import {ApiDocumentation, InterfaceDocumentation} from 'components/ApiDocumentation';
import {Snippet} from 'components/snippet/Snippet';
import {ExpandableSnippet} from 'components/expandable-snippet/ExpandableSnippet';
import {Tabs} from 'components/Tabs';
import FeatureOverview from 'components/FeatureOverview';
import IconsPanel from 'components/IconsPanel';
import ImageCaption from 'components/ImageCaption';
import MatrixTable from 'components/MatrixTable';
import VideoSection from 'components/VideoSection';
import VideoLink from 'components/VideoLink';
import ChartGallery from 'components/chart-gallery/ChartGallery';
import ChartsApiExplorer from 'components/charts-api-explorer/ChartsApiExplorer';
import FrameworkSpecificSection from 'components/FrameworkSpecificSection';
import StyledSection from 'components/StyledSection';
import {ListItem} from 'components/ListItem';
import DocumentationLink from '../components/DocumentationLink';
import Gif from 'components/Gif';
import {SEO} from 'components/SEO';
import {getHeaderTitle} from 'utils/page-header';
import stripHtml from 'utils/strip-html';
import styles from './doc-page.module.scss';
import LearningVideos from "../components/LearningVideos";
const lzString = require('lz-string');


/**
 * This template is used for documentation pages, i.e. those generated from Markdown files.
 */
const DocPageTemplate = ({data, pageContext: {framework, jsonDataAsString, exampleIndexData, pageName}}) => {
    const jsonData = jsonDataAsString ? JSON.parse(lzString.decompress(jsonDataAsString)) : null;
    const {markdownRemark: page} = data;
    const [showSideMenu, setShowSideMenu] = useState(true);

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
        options: props.options != null ? JSON.parse(props.options) : undefined
    });

    // This configures which components will be used for the specified HTML tags
    const renderAst = new rehypeReact({
        createElement: React.createElement,
        components: {
            'a': props => DocumentationLink({...props, framework}),
            'li': ListItem,
            'gif': props => Gif({...props, pageName, autoPlay: props.autoPlay != null ? JSON.parse(props.autoPlay) : false}),
            'grid-example': props => ExampleRunner(getExampleRunnerProps(props, 'grid')),
            'chart-example': props => ExampleRunner(getExampleRunnerProps(props, 'charts')),
            'api-documentation': props => ApiDocumentation({
                ...props,
                pageName,
                framework,
                jsonData,
                exampleIndexData,
                sources: props.sources != null ? JSON.parse(props.sources) : undefined,
                config: props.config != null ? JSON.parse(props.config) : undefined
            }),
            'interface-documentation': props => InterfaceDocumentation({
                ...props,
                framework,
                jsonData,
                exampleIndexData,
                config: props.config != null ? JSON.parse(props.config) : undefined
            }),
            'snippet': props => Snippet({...props, framework}),
            'expandable-snippet': props => ExpandableSnippet({
                ...props,
                framework,
                jsonData,
                exampleIndexData,
                breadcrumbs: props.breadcrumbs ? JSON.parse(props.breadcrumbs) : undefined,
                config: props.config != null ? JSON.parse(props.config) : undefined,
            }),
            'feature-overview': props => FeatureOverview({...props, framework}),
            'icons-panel': IconsPanel,
            'image-caption': props => ImageCaption({...props, pageName}),
            'matrix-table': props => MatrixTable({...props, framework, jsonData, exampleIndexData}),
            'tabs': props => Tabs({...props}),
            'learning-videos': props => LearningVideos({framework}),
            'video-section': VideoSection,
            'video-link': VideoLink,
            'chart-gallery': ChartGallery,
            'charts-api-explorer': props => ChartsApiExplorer({...props, framework, jsonData, exampleIndexData}),
            'note': props => StyledSection({...props, style: 'note'}),
            'warning': props => StyledSection({...props, style: 'warning'}),
            'styled-section': StyledSection,
            'framework-specific-section': props => FrameworkSpecificSection({...props, currentFramework: framework})
        },
    }).Compiler;

    let {title, description, version} = page.frontmatter;

    version = version ? ` ${version}` : '';

    if (!description) {
        // If no description is provided in the Markdown, we create one from the lead paragraph
        const firstParagraphNode = ast.children.filter(child => child.tagName === 'p')[0];

        if (firstParagraphNode) {
            description = stripHtml(firstParagraphNode);
        }
    }

    // solidjs is still tactical and "lives" under react - make a bit of an exception here so the title makes sense
    const pageTitle = pageName === 'solidjs' ? `SolidJS Data Grid: ${title}` : getHeaderTitle(title, framework, pageName.startsWith('charts-'), version);

    return (
        <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
            <div id="doc-content" className={classnames(styles['doc-page'], {[styles['doc-page--with-side-menu']]: showSideMenu})}>
                {/*eslint-disable-next-line react/jsx-pascal-case*/}
                <SEO title={title} description={description} framework={framework} pageName={pageName}/>
                <h1 id="top"
                    className={classnames(styles['doc-page__title'], {[styles['doc-page__title--enterprise']]: page.frontmatter.enterprise})}>{pageTitle}</h1>
                {renderAst(ast)}
            </div>
            <SideMenu headings={page.headings || []} pageName={pageName} pageTitle={title} hideMenu={() => setShowSideMenu(false)}/>
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
