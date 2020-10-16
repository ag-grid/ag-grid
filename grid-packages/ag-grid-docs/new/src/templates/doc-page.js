import React from "react";
import { Helmet } from "react-helmet";
import { graphql } from "gatsby";
import rehypeReact from "rehype-react";
import ExampleRunner from '../components/example-runner';
import SideMenu from '../components/SideMenu';
import processFrameworkSpecificSections from '../utils/framework-specific-sections';
import './doc-page.scss';

const DocPageTemplate = ({ data, pageContext: { framework }, location }) => {
  const { markdownRemark: page } = data;
  const pageName = location.pathname.replace(`/${framework}/`, '');
  const ast = processFrameworkSpecificSections(page.htmlAst, framework);

  const renderAst = new rehypeReact({
    createElement: React.createElement,
    components: {
      "example-runner": props => ExampleRunner({ ...props, framework, pageName })
    },
  }).Compiler;

  return (
    <div className="doc-page-container">
      <div className="doc-page">
        <Helmet title={`AG-Grid: ${page.frontmatter.title}`} />
        <h1>{page.frontmatter.title}</h1>
        {renderAst(ast)}
      </div>
      {page.headings && <SideMenu headings={page.headings} />}
    </div>
  );
};

export const pageQuery = graphql`
  query DocPageByPath($srcPath: String!) {
    markdownRemark(fields: { path: { eq: $srcPath } }) {
      htmlAst
      frontmatter {
        title
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
