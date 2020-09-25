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
import Layout from '../components/layout';

export default function DocPageTemplate({ data, pageContext: { framework } }) {
  const { markdownRemark: post } = data;
  const frameworkSpecificOutput = processFrameworkDependentSections(post.html, framework);
  const codeSnippetsReplaced = processCodeSnippets(frameworkSpecificOutput, framework);

  return (
    <Layout framework={framework}>
      <div className="doc-page">
        <h1>{post.frontmatter.title} ({framework})</h1>
        <div
          className="doc-page-content"
          dangerouslySetInnerHTML={{ __html: codeSnippetsReplaced }}
        />
      </div>
    </Layout>
  );
}

const processFrameworkDependentSections = (html, framework) => {
  return html.replace(/<framework-dependent>(.*?)<\/framework-dependent>/gs, (match, contents) => {
    const doc = new DOMParser().parseFromString(contents, 'text/html');

    return doc.getElementsByTagName(framework)[0].innerHTML;
  });
};

const processCodeSnippets = (html, framework) => {
  return html.replace(/<code-snippet>(.*?)<\/code-snippet>/gs, (match, contents) => {
    const doc = new DOMParser().parseFromString(contents, 'text/html');

    return highlight(doc.getElementsByTagName(framework)[0].innerHTML, framework);
  });
};

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
      html
      frontmatter {
        path
        title
      }
    }
  }
`;