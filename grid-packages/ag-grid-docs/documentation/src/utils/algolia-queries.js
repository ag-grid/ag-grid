const stripHtml = require('./strip-html');
const processFrameworkSpecificSections = require('./framework-specific-sections');
const supportedFrameworks = require('./supported-frameworks');

const pageQuery = `{
  pages: allMarkdownRemark {
    nodes {
      id
      frontmatter {
        title
        frameworks
      }
      fields {
        path
      }
      htmlAst
    }
  }
}`;

function pageToAlgoliaRecord({ id: objectID, frontmatter: { title }, fields: { path }, htmlAst }, framework) {
  const text = stripHtml(processFrameworkSpecificSections(htmlAst, framework)).substr(0, 19000);

  return {
    objectID,
    title,
    path: `/${framework}${path}/`,
    text,
  };
}

const queries = supportedFrameworks.map(framework => ({
  query: pageQuery,
  transformer: ({ data }) => data.pages.nodes
    .filter(node => !node.frontmatter.frameworks || node.frontmatter.frameworks.indexOf(framework) >= 0)
    .map(node => pageToAlgoliaRecord(node, framework)),
  indexName: `ag-grid_${framework}`,
  settings: { attributesToSnippet: [`text:20`] },
}));

module.exports = queries;