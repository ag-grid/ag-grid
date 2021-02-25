import React, { useState } from 'react';
import { graphql } from 'gatsby';
import rehypeReact from 'rehype-react';
import classnames from 'classnames';
import ExampleRunner from 'components/example-runner/ExampleRunner';
import SideMenu from 'components/SideMenu';
import processFrameworkSpecificSections from 'utils/framework-specific-sections';
import { getPageName } from 'utils/get-page-name';
import { ApiDocumentation } from 'components/ApiDocumentation';
import { Snippet } from 'components/snippet/Snippet';
import FeatureOverview from 'components/FeatureOverview';
import IconsPanel from 'components/IconsPanel';
import ImageCaption from 'components/ImageCaption';
import MatrixTable from 'components/MatrixTable';
import VideoSection from 'components/VideoSection';
import VideoLink from 'components/VideoLink';
import ChartGallery from 'components/chart-gallery/ChartGallery';
import ChartsApiExplorer from 'components/charts-api-explorer/ChartsApiExplorer';
import { ListItem } from 'components/ListItem';
import Gif from 'components/Gif';
import { SEO } from 'components/SEO';
import stripHtml from 'utils/strip-html';
import styles from './doc-page.module.scss';

const DocPageTemplate = ({ data, pageContext: { framework }, location }) => {
  const { markdownRemark: page } = data;
  const [showSideMenu, setShowSideMenu] = useState(true);

  if (!page) { return null; }

  const pageName = getPageName(location.pathname);
  const ast = processFrameworkSpecificSections(page.htmlAst, framework);

  const getExampleRunnerProps = (props, library) => ({
    ...props,
    framework,
    pageName,
    library,
    options: props.options != null ? JSON.parse(props.options) : undefined
  });

  const getSnippetProps = props => ({ ...props, framework });

  const renderAst = new rehypeReact({
    createElement: React.createElement,
    components: {
      'li': ListItem,
      'gif': props => Gif({ ...props, pageName, autoPlay: props.autoPlay != null ? JSON.parse(props.autoPlay) : false }),
      'grid-example': props => ExampleRunner(getExampleRunnerProps(props, 'grid')),
      'chart-example': props => ExampleRunner(getExampleRunnerProps(props, 'charts')),
      'api-documentation': props => ApiDocumentation({
        ...props,
        pageName,
        sources: props.sources != null ? JSON.parse(props.sources) : undefined,
        config: props.config != null ? JSON.parse(props.config) : undefined
      }),
      'snippet': props => Snippet(getSnippetProps(props)),
      'feature-overview': FeatureOverview,
      'icons-panel': IconsPanel,
      'image-caption': props => ImageCaption({ ...props, pageName }),
      'matrix-table': MatrixTable,
      'video-section': VideoSection,
      'video-link': VideoLink,
      'chart-gallery': ChartGallery,
      'charts-api-explorer': props => ChartsApiExplorer({ ...props, framework }),
    },
  }).Compiler;

  let { title, description } = page.frontmatter;

  if (!description) {
    const firstParagraphNode = ast.children.filter(child => child.tagName === 'p')[0];

    if (firstParagraphNode) {
      description = stripHtml(firstParagraphNode);
    }
  }

  return (
    <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
      <div id="doc-content" className={classnames(styles['doc-page'], { [styles['doc-page--with-side-menu']]: showSideMenu })}>
        <SEO title={title} description={description} framework={framework} pageName={pageName} />
        <h1 id="top" className={classnames(styles['doc-page__title'], { [styles['doc-page__title--enterprise']]: page.frontmatter.enterprise })}>{title}</h1>
        {renderAst(ast)}
      </div>
      <SideMenu headings={page.headings || []} pageName={pageName} pageTitle={title} hideMenu={() => setShowSideMenu(false)} />
    </div>
  );
};

export const pageQuery = graphql`
  query DocPageByPath($srcPath: String!) {
    markdownRemark(fields: { path: { eq: $srcPath } }) {
      htmlAst
      frontmatter {
        title
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
