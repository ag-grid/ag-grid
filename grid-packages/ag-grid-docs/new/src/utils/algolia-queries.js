const escapeStringRegexp = require('escape-string-regexp');
const stripHtml = require('./strip-html');
const processFrameworkSpecificSections = require('./framework-specific-sections');

const pagePath = 'pages';

const pageQuery = `{
  pages: allMarkdownRemark(
    filter: {
      fileAbsolutePath: { regex: "/${escapeStringRegexp(pagePath)}/" },
    }
  ) {
    edges {
      node {
        id
        frontmatter {
          title
        }
        fields {
          path
        }
        htmlAst
      }
    }
  }
}`;

const frameworks = ['javascript', 'angular', 'react', 'vue'];

function pageToAlgoliaRecord({ node: { id, frontmatter: { title }, fields: { path }, htmlAst } }, framework) {
  const processedAst = processFrameworkSpecificSections(htmlAst, framework);

  return {
    objectID: id,
    title,
    path: `../../${framework}${path}`,
    text: stripHtml(processedAst),
  };
}

const queries = frameworks.map(framework => ({
  query: pageQuery,
  transformer: ({ data }) => data.pages.edges.map(node => pageToAlgoliaRecord(node, framework)),
  indexName: `ag-grid_${framework}`,
  settings: { attributesToSnippet: [`text:20`] },
}));

module.exports = queries;