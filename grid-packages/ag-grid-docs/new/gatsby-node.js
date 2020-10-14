const path = require('path');
const express = require('express');
const { createFilePath } = require('gatsby-source-filesystem');

exports.onCreateNode = ({ node, getNode, actions: { createNodeField } }) => {
    if (node.internal.type === 'MarkdownRemark') {
        const filePath = createFilePath({ node, getNode });

        createNodeField({
            node,
            name: 'path',
            value: filePath.substring(0, filePath.length - 1)
        });
    }
};

exports.onCreatePage = ({ page, actions: { createPage } }) => {
    // this allows us to use different layouts for different pages
    if (page.path.match(/example-runner/)) {
        page.context.layout = 'bare';
        createPage(page);
    }
};

exports.createPages = async ({ actions: { createPage }, graphql, reporter }) => {
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

exports.onCreateWebpackConfig = ({ actions }) => {
    actions.setWebpackConfig({
        node: {
            fs: 'empty'
        }
    });
};
