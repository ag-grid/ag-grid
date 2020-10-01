const path = require("path");
const express = require(`express`);
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions;

    if (node.internal.type === `MarkdownRemark`) {
        const filePath = createFilePath({ node, getNode });

        createNodeField({
            node,
            name: 'path',
            value: filePath.substring(0, filePath.length - 1)
        });
    }
};

exports.createPages = async ({ actions, graphql, reporter }) => {
    const { createPage } = actions;
    const docPageTemplate = path.resolve(`src/templates/doc-page.js`);

    const result = await graphql(`
        {
            allMarkdownRemark {
                edges {
                    node {
                        fields {
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
                path: `/${framework}${node.fields.path}`,
                component: docPageTemplate,
                context: { framework, srcPath: node.fields.path, }
            });
        });
    });
};

// Enable development support for serving HTML from `./static` folder
exports.onCreateDevServer = ({ app }) => {
    app.use(express.static(`public`));
};