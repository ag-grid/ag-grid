import React from "react";
import { graphql } from "gatsby";
import * as Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-java";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-scss";
import rehypeReact from "rehype-react";
import ExampleRunner from '../components/ExampleRunner';
import FrameworkSpecificContent from '../components/FrameworkSpecificContent';

export default function DocPageTemplate({ data, pageContext: { framework } }) {
  const { markdownRemark: page } = data;

  const renderAst = new rehypeReact({
    createElement: React.createElement,
    components: {
      "example-runner": props => ExampleRunner({ ...props, framework }),
      "framework-specific-content": props => FrameworkSpecificContent({ ...props, framework })
    },
  }).Compiler;

  return (
    <div className="doc-page">
      <h1>{page.frontmatter.title}</h1>
      {renderAst(page.htmlAst)}
    </div>
  );
}

const FrameworkMap = {
  javascript: Prism.languages.javascript,
  angular: Prism.languages.typescript,
  react: Prism.languages.jsx,
  vue: Prism.languages.javascript,
};

export function highlight(code, framework) {
  const prismLanguage = FrameworkMap[framework];
  return `<pre class="language-${prismLanguage}><code class="language-${prismLanguage}>${Prism.highlight(code, prismLanguage)}</code></pre>`;
}

export const pageQuery = graphql`
  query DocPageByPath($srcPath: String!) {
    markdownRemark(frontmatter: { path: { eq: $srcPath } }) {
      htmlAst
      frontmatter {
        path
        title
      }
    }
  }
`;