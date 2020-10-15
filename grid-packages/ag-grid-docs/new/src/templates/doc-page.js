import React from "react";
import { Helmet } from "react-helmet";
import { graphql } from "gatsby";
import rehypeReact from "rehype-react";
import ExampleRunner from '../components/ExampleRunner';
import SideMenu from '../components/SideMenu';
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

const processFrameworkSpecificSections = (ast, framework) => {
  return {
    ...ast,
    children: ast.children.reduce((children, child) => {
      if (child.properties != null && child.tagName === 'div' && child.properties.className[0] === 'custom-block') {
        const blockCustomClass = child.properties.className[1];

        if (blockCustomClass.endsWith('-only-section')) {
          if (blockCustomClass === `${framework}-only-section`) {
            return [...children, ...child.children[0].children];
          } else {
            return children;
          }
        }
      }

      return [...children, child];
    }, [])
  };
};

export default DocPageTemplate;
