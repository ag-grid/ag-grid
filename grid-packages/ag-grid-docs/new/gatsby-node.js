const path = require('path');
const express = require('express');
const { createFilePath } = require('gatsby-source-filesystem');
const { GraphQLString } = require('gatsby/graphql');
const fs = require('fs-extra');

exports.setFieldsOnGraphQLNodeType = ({ type, getNodeAndSavePathDependency, pathPrefix = `` }) => {
    if (type.name !== `File`) {
        return {};
    }

    return {
        publicURL: {
            type: GraphQLString,
            args: {},
            description: `Copy static files return public URLs`,
            resolve: async (file, fieldArgs, context) => {
                const details = getNodeAndSavePathDependency(file.id, context.path);

                let fileName = `static/${file.internal.contentDigest}/${details.base}`;

                if (file.relativeDirectory.indexOf('/examples/') >= 0) {
                    // handle example runner files separately to preserve the directory structure
                    let rootDirectory = 'examples/' + file.relativeDirectory.replace('/examples/', '/').replace('/_gen/', '/');
                    fileName = `${rootDirectory}/${details.base}`;
                }

                const publicPath = path.join(process.cwd(), `public`, fileName);

                if (!fs.existsSync(publicPath)) {
                    fs.copy(
                        details.absolutePath,
                        publicPath,
                        { dereference: true },
                        err => {
                            if (err) {
                                console.error(
                                    `error copying file from ${details.absolutePath} to ${publicPath}`,
                                    err
                                );
                            }
                        }
                    );
                }

                return `${pathPrefix}/${fileName}`;
            },
        },
    };
};

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
