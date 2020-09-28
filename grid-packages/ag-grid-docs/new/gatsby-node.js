const path = require("path");
const express = require(`express`);

exports.createPages = async ({ actions, graphql, reporter }) => {
    const { createPage } = actions;
    const docPageTemplate = path.resolve(`src/templates/doc-page.js`);

    const result = await graphql(`
        {
            allMarkdownRemark {
                edges {
                    node {
                        frontmatter {
                            path
                        }
                    }
                }
            }
        }
    `);

    if (result.errors) {
        reporter.panicOnBuild(`Error while running GraphQL query.`);
        return;
    }

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        ['javascript', 'react', 'angular', 'vue'].forEach(framework => {
            createPage({
                path: `/${framework}${node.frontmatter.path}`,
                component: docPageTemplate,
                context: { framework, srcPath: node.frontmatter.path, }
            });
        });
    });
};

// Enable development support for serving HTML from `./static` folder
exports.onCreateDevServer = ({ app }) => {
    app.use(express.static(`public`));
};