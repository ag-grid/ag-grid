const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');
const { CODES, prefixId } = require('gatsby-source-filesystem/error-utils');
const { GraphQLString } = require('gatsby/graphql');
const fs = require('fs-extra');
const publicIp = require('public-ip');
const gifFrames = require('gif-frames');
const supportedFrameworks = require('./src/utils/supported-frameworks.js');
const chartGallery = require('./doc-pages/charts/gallery.json');
const toKebabCase = require('./src/utils/to-kebab-case');
const isDevelopment = require('./src/utils/is-development');

exports.onPreBootstrap = ({ reporter }) => {
    reporter.info("---[ Initial configuration ]----------------------------------------------------");

    Object.keys(process.env).filter(key => key.startsWith('GATSBY_')).forEach(key => {
        reporter.info(`${key}=${process.env[key]}`);
    });

    reporter.info("--------------------------------------------------------------------------------");
};

/* This is an override of the code in https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-filesystem/src/extend-file-node.js
 * We override this to allow us to specify the directory structure of the example files, so that we can reference
 * them correctly in the examples. By default, Gatsby includes a cache-busting hash of the file which would cause
 * problems if we included it. It does mean that example files could be held in the cache though. */
exports.setFieldsOnGraphQLNodeType = ({ type, getNodeAndSavePathDependency, pathPrefix = ``, reporter }) => {
    if (type.name !== `File`) {
        return {};
    }

    return {
        publicURL: {
            type: GraphQLString,
            args: {},
            description: `Copy file to static directory and return public URL to it`,
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

                // if example files have been updated in the last minute, overwrite them
                const isRecent = dateMs => (new Date().getTime() - dateMs) < 60000;
                const forceOverwrite = isExampleFile && (isRecent(file.ctimeMs) || isRecent(file.mtimeMs));

                if (!fs.existsSync(publicPath) || forceOverwrite) {
                    fs.copySync(
                        details.absolutePath,
                        publicPath,
                        { dereference: true },
                        err => {
                            if (err) {
                                reporter.panic(
                                    {
                                        id: prefixId(CODES.MissingResource),
                                        context: {
                                            sourceMessage: `error copying file from ${details.absolutePath} to ${publicPath}`,
                                        },
                                    },
                                    err
                                );
                            }
                        }
                    );

                    if (!isDevelopment() && publicPath.endsWith('.gif')) {
                        try {
                            // create first frame still
                            const frameData = await gifFrames({
                                url: details.absolutePath,
                                frames: 0,
                                type: 'png',
                                quality: 100,
                            });

                            frameData[0].getImage().pipe(fs.createWriteStream(publicPath.replace('.gif', '-still.png')));
                        } catch (err) {
                            console.error(`Failed to create still from ${details.absolutePath}`);

                            reporter.panic(
                                {
                                    id: prefixId(CODES.MissingResource),
                                    context: {
                                        sourceMessage: `Could not create still from ${details.absolutePath}`,
                                    },
                                },
                                err
                            );
                        }
                    }
                }

                return `${pathPrefix}/${fileName}`;
            }
        }
    };
};

/* We add the path onto markdown nodes which allows us to then find the relevant file when generating pages */
exports.onCreateNode = async ({ node, loadNodeContent, getNode, actions: { createNodeField } }) => {
    if (node.internal.type === 'MarkdownRemark') {
        const filePath = createFilePath({ node, getNode });

        createNodeField({
            node,
            name: 'path',
            value: filePath.substring(0, filePath.length - 1)
        });
    } else if (node.internal.type === 'File' && node.extension === 'json') {
        // load contents of JSON files to be used e.g. by ApiDocumentation
        node.internal.content = await loadNodeContent(node);
    }
};

/* This allows us to use different layouts for different pages */
exports.onCreatePage = ({ page, actions: { createPage } }) => {
    if (page.path.match(/example-runner/)) {
        page.context.layout = 'bare';
        createPage(page);
    }
};

const getInternalIPAddress = () => {
    const interfaces = require('os').networkInterfaces();

    for (let devName in interfaces) {
        const iface = interfaces[devName];

        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];

            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }

    return '0.0.0.0';
};

const createHomePages = createPage => {
    const homePage = path.resolve('src/templates/home.jsx');

    supportedFrameworks.forEach(framework => {
        createPage({
            path: `/${framework}/`,
            component: homePage,
            context: { frameworks: supportedFrameworks, framework }
        });
    });
};

const createDocPages = async (createPage, graphql, reporter) => {
    const docPageTemplate = path.resolve(`src/templates/doc-page.jsx`);

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
        const { frontmatter: { frameworks: specifiedFrameworks }, fields: { path: srcPath } } = node;

        if (srcPath.split('/').some(part => part.startsWith('_'))) { return; }

        const frameworks = supportedFrameworks.filter(f => !specifiedFrameworks || specifiedFrameworks.includes(f));

        frameworks.forEach(framework => {
            createPage({
                path: `/${framework}${srcPath}/`,
                component: docPageTemplate,
                context: { frameworks, framework, srcPath }
            });
        });
    });
};

const createChartGalleryPages = createPage => {
    const chartGalleryPageTemplate = path.resolve(`src/templates/chart-gallery-page.jsx`);
    const categories = Object.keys(chartGallery);

    const namesByCategory = categories.reduce(
        (names, c) => names.concat(Object.keys(chartGallery[c]).map(k => ({ category: c, name: k }))),
        []);

    namesByCategory.forEach(({ category, name }, i) => {
        const { description } = chartGallery[category][name];

        let previous = i > 0 ? namesByCategory[i - 1].name : null;
        let next = i < namesByCategory.length - 1 ? namesByCategory[i + 1].name : null;

        supportedFrameworks.forEach(framework => {
            createPage({
                path: `/${framework}/charts/${toKebabCase(name)}/`,
                component: chartGalleryPageTemplate,
                context: { frameworks: supportedFrameworks, framework, name, description, previous, next }
            });
        });
    });
};

/* This creates pages for each framework from all of the markdown files, using the doc-page template */
exports.createPages = async ({ actions: { createPage }, graphql, reporter }) => {
    if (!process.env.GATSBY_HOST) {
        process.env.GATSBY_HOST =
            process.env.NODE_ENV === 'development' ? `${getInternalIPAddress()}:8080` : `${await publicIp.v4()}:9000`;
    }

    createHomePages(createPage);
    await createDocPages(createPage, graphql, reporter);
    createChartGalleryPages(createPage);
};

exports.onCreateWebpackConfig = ({ actions, getConfig }) => {
    actions.setWebpackConfig({
        /* We use fs to write some files during the build, but fs is only available at compile time. This allows the
         * site to load at runtime by providing a dummy fs */
        node: {
            fs: 'empty',
        },
        resolve: {
            // add src folder as default root for imports
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        }
    });

    const config = getConfig();
    const { rules } = config.module;

    rules.forEach(rule => {
        const urlLoaders = Array.isArray(rule.use) ? rule.use.filter(use => use.loader.indexOf('/url-loader/') >= 0) : [];

        // reduce maximum size for inlined assets to 512 bytes
        urlLoaders.forEach(loader => loader.options.limit = 512);
    });

    actions.replaceWebpackConfig(config);
};
