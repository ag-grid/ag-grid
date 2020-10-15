const escapeStringRegexp = require('escape-string-regexp');

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
        excerpt(pruneLength: 5000)
      }
    }
  }
}`;

function pageToAlgoliaRecord({ node: { id, frontmatter, fields, ...rest } }) {
    return {
        objectID: id,
        ...frontmatter,
        ...fields,
        ...rest,
    };
}

const queries = [
    {
        query: pageQuery,
        transformer: ({ data }) => data.pages.edges.map(pageToAlgoliaRecord),
        indexName: process.env.GATSBY_ALGOLIA_SEARCH_INDEX,
        settings: { attributesToSnippet: [`excerpt:20`] },
    },
];

module.exports = queries;