const path = require('path');
const express = require('express');
const { createFilePath } = require('gatsby-source-filesystem');
const { GraphQLString } = require('gatsby/graphql');
const fs = require('fs-extra');
const supportedFrameworks = require('./src/utils/supported-frameworks.js');

/* We override this to allow us to specify the directory structure of the example files, so that we can reference
 * them correctly in the examples. By default, Gatsby includes a cache-busting hash of the file which would cause
 * problems if we included it. It does mean that example files could be held in the cache though. */
exports.setFieldsOnGraphQLNodeType = ({ type, getNodeAndSavePathDependency, pathPrefix = `` }) => {
    if (type.name !== `File`) {
        return {};
    }

    return {
        publicURL: {
            type: GraphQLString,
            args: {},
            description: `Copy static files return public URLs`,
            resolve: async (file, _, context) => {
                const details = getNodeAndSavePathDependency(file.id, context.path);

                let fileName = `static/${file.internal.contentDigest}/${details.base}`;
                let isExampleFile = false;

                if (file.relativeDirectory.indexOf('/examples/') >= 0) {
                    // handle example runner files separately to preserve the directory structure
                    let rootDirectory = 'examples/' + file.relativeDirectory.replace('/examples/', '/').replace('/_gen/', '/');
                    fileName = `${rootDirectory}/${details.base}`;
                    isExampleFile = true;
                }

                const publicPath = path.join(process.cwd(), `public`, fileName);

                if (!fs.existsSync(publicPath) || isExampleFile) {
                    fs.copySync(
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

/* We add the path onto markdown nodes which allows us to then find the relevant file when generating pages */
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

/* This allows us to use different layouts for different pages */
exports.onCreatePage = ({ page, actions: { createPage } }) => {
    if (page.path.match(/example-runner/)) {
        page.context.layout = 'bare';
        createPage(page);
    }
};

/* This creates pages for each framework from all of the markdown files, using the doc-page template */
exports.createPages = async ({ actions: { createPage }, graphql, reporter }) => {
    const docPageTemplate = path.resolve(`src/templates/doc-page.js`);

    const result = await graphql(`
        {
            allMarkdownRemark {
                nodes {
                    frontmatter {
                        frameworks
                    }
                    fields {
                        path
                    }
                }
            }
        }
    `);

    if (result.errors) {
        reporter.panicOnBuild(`Error while running GraphQL query.`);
        return;
    }

    result.data.allMarkdownRemark.nodes.forEach(node => {
        const { frontmatter: { frameworks: specifiedFrameworks } } = node;

        supportedFrameworks
            .filter(f => !specifiedFrameworks || specifiedFrameworks.includes(f))
            .forEach(framework => {
                createPage({
                    path: `/${framework}${node.fields.path}/`,
                    component: docPageTemplate,
                    context: { frameworks: supportedFrameworks, framework, srcPath: node.fields.path, }
                });
            });
    });
};

/* This allows HTML files from the static folder to be served in development mode */
exports.onCreateDevServer = ({ app }) => {
    app.use(express.static(`public`));
};

/* We use fs to write some files during the build, but fs is only available at compile time. This allows the site to
 * load at runtime by providing a dummy fs */
exports.onCreateWebpackConfig = ({ actions }) => {
    actions.setWebpackConfig({
        node: {
            fs: 'empty'
        }
    });
};
