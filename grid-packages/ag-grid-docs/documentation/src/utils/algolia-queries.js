const escapeStringRegexp = require('escape-string-regexp');
const stripHtml = require('./strip-html');
const processFrameworkSpecificSections = require('./framework-specific-sections');
const supportedFrameworks = require('./supported-frameworks');

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

function pageToAlgoliaRecord({ node: { id: objectID, frontmatter: { title }, fields: { path }, htmlAst } }, framework) {
  const text = stripHtml(processFrameworkSpecificSections(htmlAst, framework)).substr(0, 10000);

  return {
    objectID,
    title,
    path: `../../${framework}${path}/`,
    text,
  };
}

const queries = supportedFrameworks.map(framework => ({
  query: pageQuery,
  transformer: ({ data }) => data.pages.edges.map(node => pageToAlgoliaRecord(node, framework)),
  indexName: `ag-grid_${framework}`,
  settings: { attributesToSnippet: [`text:20`] },
}));

module.exports = queries;