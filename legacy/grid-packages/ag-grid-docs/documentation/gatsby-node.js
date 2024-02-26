/**
 * Gatsby gives plugins and site builders many APIs for controlling your site’s data in the GraphQL data layer. Code in
 * the file gatsby-node.js is run once in the process of building your site. You can use it to create pages dynamically,
 * add nodes in GraphQL, or respond to events during the build lifecycle.
 * https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const path = require('path');
const {createFilePath} = require('gatsby-source-filesystem');
const {CODES, prefixId} = require('gatsby-source-filesystem/error-utils');
const {GraphQLString} = require('gatsby/graphql');
const fs = require('fs-extra');
const publicIp = require('public-ip');
const gifFrames = require('gif-frames');
const supportedFrameworks = require('./src/utils/supported-frameworks.js');
const toKebabCase = require('./src/utils/to-kebab-case');
const isDevelopment = require('./src/utils/is-development');
const convertToFrameworkUrl = require('./src/utils/convert-to-framework-url');

/**
 * This hides the config file that we use to show linting in IDEs from Gatsby.
 * See .eslintrc.js for more information.
 */
const showHideEsLintConfigFile = (reporter, hide) => {
    const originalFileName = '.eslintrc.js';
    const hiddenFileName = '_eslintrc.js';

    if (hide && fs.existsSync(originalFileName)) {
        reporter.info(`Hiding IDE ESLint file...`);
        fs.moveSync(originalFileName, hiddenFileName, {overwrite: true});
    }

    if (!hide && fs.existsSync(hiddenFileName)) {
        reporter.info(`Restoring IDE ESLint file...`);
        fs.moveSync(hiddenFileName, originalFileName);
    }
};

/**
 * This runs very early in the build lifecycle, to print out information about configuration.
 */
exports.onPreInit = ({reporter}) => {
    reporter.info("---[ Initial configuration ]----------------------------------------------------");

    Object.keys(process.env).filter(key => key.startsWith('GATSBY_')).forEach(key => {
        reporter.info(`${key}=${process.env[key]}`);
    });

    reporter.info("--------------------------------------------------------------------------------");
};

/**
 * Once the bootstrap is finished, move the IDE ESLint file before the Gatsby build, so that Gatsby will use its defaults.
 * See .eslintrc.js for more information.
 */
exports.onPostBootstrap = ({reporter}) => {
    showHideEsLintConfigFile(reporter, true);
};

/**
 * Restore the IDE ESLint file once Gatsby has finished building. This will handle the case for development mode
 * or a production build.
 * See .eslintrc.js for more information.
 */
exports.onPostBuild = exports.onCreateDevServer = ({reporter}) => {
    showHideEsLintConfigFile(reporter, false);

    // gatsby-plugin-sitemap generates sitemap-index.xml, but most tools expect sitemap.xml
    // we rename the generated file here
    if (fs.existsSync('./public/sitemap-index.xml')) {
        fs.renameSync('./public/sitemap-index.xml', './public/sitemap.xml');
    }
};

/**
 * This allows us to add fields to GraphQL nodes. This code is based on the code in
 * https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-filesystem/src/extend-file-node.js
 * We override this to allow us to specify the directory structure of the example files, so that we can reference
 * them correctly in the examples. By default, Gatsby includes a cache-busting hash of the file which would cause
 * problems if we included it. It does mean that example files could be held in a browser cache though. We also use
 * this hook to produce still images for GIFs, which are loaded before the GIF is played.
 */
exports.setFieldsOnGraphQLNodeType = ({type, getNodeAndSavePathDependency, pathPrefix = ``, reporter}) => {
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
                        {dereference: true},
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

/**
 * This is called when nodes are created. We add the path field onto Markdown nodes which allows us to then find the
 * relevant file when generating pages. We also load content for JSON files so that it can be accessed.
 */
exports.onCreateNode = async ({node, loadNodeContent, getNode, actions: {createNodeField}}) => {
    if (node.internal.type === 'MarkdownRemark') {
        const filePath = createFilePath({node, getNode});

        createNodeField({
            node,
            name: 'path',
            value: filePath.substring(0, filePath.length - 1)
        });
    } else if (node.internal.type === 'File' && node.internal.mediaType === 'application/json') {
        // load contents of JSON files to be used e.g. by ApiDocumentation
        await createNodeField({
            node,
            name: 'content',
            value: await loadNodeContent(node)
        });
    }
};

const FULL_SCREEN_PAGES = ['example', 'theme-builder'];

const FULL_SCREEN_WITH_FOOTER_PAGES = [
    'license-pricing',
    'about',
    'cookies',
    'privacy',
    'style-guide',
];

const BARE_PAGES = [
    'license-pricing-bare'
]

const SUPPRESS_FRAMEWORK_SELECTOR_PAGES = [
    'pipeline',
    'changelog'
];

function matchesPath(page, path) {
    const regex = new RegExp(page, 'g');
    return path.match(regex)
}

const isFullScreenPage = path => path === '/' || FULL_SCREEN_PAGES.some(page => matchesPath(page, path));
const isFullScreenPageWithFooter = path => FULL_SCREEN_WITH_FOOTER_PAGES.some(page => matchesPath(page, path));
const isBarePage = path => BARE_PAGES.some(page => matchesPath(page, path));
const isSuppressFrameworkSelector = path => SUPPRESS_FRAMEWORK_SELECTOR_PAGES.some(page => matchesPath(page, path));

/**
 * This is called when pages are created. We override the default layout for certain pages e.g. the example-runner page.
 */
exports.onCreatePage = ({page, actions: {createPage}}) => {
    // used in layouts/index.js
    if (page.path.match(/example-runner/) || isBarePage(page.path)) {
        page.context.layout = 'bare';
        createPage(page);
    } else if (isFullScreenPage(page.path)) {
        page.context.layout = 'fullScreenPage';
        createPage(page);
    } else if (isFullScreenPageWithFooter(page.path)) {
        page.context.layout = 'fullScreenPageWithFooter';
        createPage(page);
    } else if (isSuppressFrameworkSelector(page.path)) {
        page.context.layout = 'suppressFrameworkSelector';
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
    createPage({
        path: `/documentation/`,
        component: path.resolve('src/pages/loading.jsx'),
    });
};

/**
 * This creates pages for each of the Markdown files, creating different versions for each framework that the Markdown
 * file supports (by default, all frameworks).
 */
const createDocPages = async (createPage, graphql, reporter) => {
    const docPageTemplate = path.resolve(`src/templates/doc-page.jsx`);

    const result = await graphql(`
        {
            allMarkdownRemark {
                nodes {
                    htmlAst
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
        const {frontmatter: {frameworks: specifiedFrameworks}, fields: {path: srcPath}} = node;
        const frameworks = supportedFrameworks.filter(f => !specifiedFrameworks || specifiedFrameworks.includes(f));
        const parts = srcPath.split('/').filter(x => x !== '');
        const pageName = parts[parts.length - 1];

        frameworks.forEach(framework => {
            createPage({
                path: convertToFrameworkUrl(srcPath, framework),
                component: docPageTemplate,
                context: {frameworks, framework, srcPath, pageName}
            });
        });
    });
};

/**
 * This allows us to generate pages for the website.
 */
exports.createPages = async ({actions: {createPage}, graphql, reporter}) => {
    if (!process.env.GATSBY_HOST) {
        process.env.GATSBY_HOST =
            process.env.NODE_ENV === 'development' ? `${getInternalIPAddress()}:8080` : `${await publicIp.v4()}:9000`;
    }

    createHomePages(createPage);
    await createDocPages(createPage, graphql, reporter);
};

/**
 * This allows us to customise the webpack configuration.
 */
exports.onCreateWebpackConfig = ({actions, getConfig}) => {
    const frameworks = ['angular', 'react', 'vue'];
    const frameworkRequest = request => {
        return frameworks.some(framework => request.includes(framework))
    }

    class AgEs5CjsResolver {
        constructor(source, target) {
            this.source = source || 'resolve';
            this.target = target || 'resolve';
        }

        apply(resolver) {
            var target = resolver.ensureHook(this.target);
            resolver.getHook(this.source).tapAsync('AgEs5CjsResolver', function (request, resolveContext, callback) {
                const req = request.request;
                if (req.startsWith('@ag-grid') &&
                    !req.includes('css') &&
                    !frameworkRequest(req)) {

                    // point the request to the commonjs es5 dir - this is what gets updated on local build changes
                    const newRequest = `${__dirname}/node_modules/${req}/dist/cjs/es5/main.js`;

                    const obj = {
                        path: request.path,
                        request: newRequest,
                        query: request.query,
                        directory: request.directory
                    };
                    return resolver.doResolve(target, obj, null, resolveContext, callback);
                }
                callback();
            });
        }
    }

    const newConfig = {
        /* We use fs to write some files during the build, but fs is only available at compile time. This allows the
         * site to load at runtime by providing a dummy fs */
        node: {
            fs: 'empty',
        },
        resolve: {
            // add src folder as default root for imports
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            alias: {
                // ensure all requests go to the same ag-charts-community
                "ag-charts-community": path.resolve(__dirname, 'node_modules/@ag-grid-enterprise/charts-enterprise/node_modules/ag-charts-community')
            }
        }
    };
    if (isDevelopment()) {
        // favour cjs over es6 (docs only rebuilds cjs...) in dev mode
        newConfig.resolve['plugins'] = [new AgEs5CjsResolver()];
    }
    actions.setWebpackConfig(newConfig);

    const config = getConfig();
    const {rules} = config.module;

    const miniCssExtractPlugin = config.plugins.find(
        plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
    )

    if (miniCssExtractPlugin) {
        miniCssExtractPlugin.options.ignoreOrder = true
    }

    rules.forEach(rule => {
        const urlLoaders = Array.isArray(rule.use) ? rule.use.filter(use => use.loader.indexOf('/url-loader/') >= 0) : [];

        // reduce maximum size for inlined assets to 512 bytes
        urlLoaders.forEach(loader => loader.options.limit = 512);
    });

    actions.replaceWebpackConfig(config);
};
