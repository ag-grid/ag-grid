import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import rehypeReact from 'rehype-react';
import ExampleRunner from '../components/example-runner';
import SideMenu from '../components/SideMenu';
import processFrameworkSpecificSections from '../utils/framework-specific-sections';
import { getPageName } from '../utils/get-page-name';
import { ApiDocumentation } from '../components/ApiDocumentation';
import IconsPanel from '../components/IconsPanel';
import ImageCaption from '../components/ImageCaption';
import styles from './doc-page.module.scss';
import MatrixTable from '../components/MatrixTable';
import VideoSection from '../components/VideoSection';
import VideoLink from '../components/VideoLink';
import ChartGallery from '../components/chart-gallery/ChartGallery';

const DocPageTemplate = ({ data, pageContext: { framework }, location }) => {
  const { markdownRemark: page } = data;
  const pageName = getPageName(location.pathname);
  const ast = processFrameworkSpecificSections(page.htmlAst, framework);
  const getExampleRunnerProps = (props, library) => ({
    ...props,
    framework,
    pageName,
    library,
    options: props.options != null ? JSON.parse(props.options) : undefined
  });

  const renderAst = new rehypeReact({
    createElement: React.createElement,
    fragment: true,
    components: {
      'grid-example': props => ExampleRunner(getExampleRunnerProps(props, 'grid')),
      'chart-example': props => ExampleRunner(getExampleRunnerProps(props, 'charts')),
      'api-documentation': props => ApiDocumentation({
        ...props,
        pageName,
        sources: props.sources != null ? JSON.parse(props.sources) : undefined,
        config: props.config != null ? JSON.parse(props.config) : undefined
      }),
      'icons-panel': IconsPanel,
      'image-caption': ImageCaption,
      'matrix-table': MatrixTable,
      'video-section': VideoSection,
      'video-link': VideoLink,
      'chart-gallery': ChartGallery,
    },
  }).Compiler;

  return (
    <div id="doc-page-wrapper" className={styles.docPageWrapper}>
      <div id="doc-content" className={styles.docPage}>
        <Helmet title={`AG-Grid: ${page.frontmatter.title}`} />
        <h1 className={page.frontmatter.enterprise ? styles.enterprise : null}>{page.frontmatter.title}</h1>
        {renderAst(ast)}
      </div>
      {<SideMenu headings={page.headings} pageName={pageName} />}
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
