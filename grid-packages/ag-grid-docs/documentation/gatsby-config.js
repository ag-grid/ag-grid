/**
 * The file gatsby-config.js defines your site’s metadata, plugins, and other general configuration.
 * https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

require('dotenv').config();

const isDevelopment = require('./src/utils/is-development');

const agGridVersion = require('../../../grid-community-modules/core/package.json').version;
const agChartsVersion = require('../../../charts-community-modules/ag-charts-community/package.json').version;

// We use graceful-fs to stop issues with running out of file handles, particularly on Windows
const fs = require('fs');
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);

const plugins = [
    {
        // This allows IE11 to work in develop mode
        resolve: 'gatsby-plugin-compile-es6-packages',
        options: {
            modules: ['popper.js', 'query-string', 'split-on-first']
        }
    },
    {
        // This extracts the HTML from files to be used in the example runner
        resolve: `gatsby-transformer-rehype`,
        options: {
            filter: node => node.sourceInstanceName === 'doc-pages' &&
                node.relativePath.indexOf('/_gen/') < 0 &&
                node.ext === '.html',
        },
    },
    // wraps each page with the layout (ie layouts/index.js)
    'gatsby-plugin-layout', // This provides a common template for the website pages
    `gatsby-plugin-image`,
    'gatsby-plugin-sharp', // This is used for handling images
    'gatsby-transformer-sharp', // This is used for handling images
    {
        // This creates pages from React components in the pages folder. The example-runner page is only needed in
        // development mode in order to show examples in a new tab; in production, all the examples have been statically
        // generated so have an index.html to open.
        resolve: 'gatsby-plugin-page-creator',
        options: {
            path: `${__dirname}/src/pages`,
            ignore: isDevelopment() ? undefined : ['example-runner.jsx'],
        },
    },
    {
        // This provides access to all the files stored in doc-pages
        resolve: 'gatsby-source-filesystem',
        options: {
            path: `${__dirname}/doc-pages`,
            name: 'doc-pages',
            ignore: ['**/_*.md'], // exclude partial Markdown files (they are included when the parent is loaded)
        },
    },
    {
        // This transforms Markdown pages into a GraphQL schema, which can then be used to access structured data
        resolve: 'gatsby-transformer-remark',
        options: {
            plugins: [
                {
                    resolve: 'gatsby-remark-token-replace',
                    options: {
                        replacements: {
                            '@AG_GRID_VERSION@': agGridVersion,
                            '@AG_CHARTS_VERSION@': agChartsVersion
                        }
                    }
                },
                {
                    // This handles images from Markdown files
                    resolve: 'gatsby-remark-images',
                    options: {
                        maxWidth: 800,
                        quality: 100,
                    },
                },
                'gatsby-remark-attr', // This allows attributes to be used in Markdown, e.g. for images//
                {
                    // This adds custom blocks to Markdown, e.g. for info or warning messages, and our framework-specific sections
                    resolve: 'gatsby-remark-custom-blocks',
                    options: {
                        blocks: {
                            note: {
                                classes: 'note',
                                title: 'optional',
                            },
                            warning: {
                                classes: 'note warning',
                                title: 'optional'
                            },
                            'only-javascript': {
                                classes: 'javascript-only-section',
                            },
                            'only-angular': {
                                classes: 'angular-only-section',
                            },
                            'only-react': {
                                classes: 'react-only-section',
                            },
                            'only-vue': {
                                classes: 'vue-only-section',
                            },
                            'only-angular-or-vue': {
                                classes: 'angular-or-vue-only-section',
                            },
                            'only-angular-or-react': {
                                classes: 'angular-or-react-only-section',
                            },
                            'only-javascript-or-angular-or-vue': {
                                classes: 'angular-or-vue-or-javascript-only-section',
                            },
                            'only-javascript-or-angular-or-react': {
                                classes: 'angular-or-react-or-javascript-only-section',
                            },
                            'only-frameworks': {
                                classes: 'frameworks-only-section',
                            }
                        },
                    },
                },
                // This ensures the parent tag of Markdown content is a div rather than a p, to avoid warnings in the browser
                'gatsby-remark-component-parent2div',
                {
                    // This creates links for each header element, with an icon that appears to the left of the header on hover
                    resolve: 'gatsby-remark-autolink-headers',
                    options: {
                        enableCustomId: true,
                        removeAccents: true,
                        isIconAfterHeader: true,
                        className: 'docs-header-icon',
                        icon: '<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M29.25,6.76a6,6,0,0,0-8.5,0l1.42,1.42a4,4,0,1,1,5.67,5.67l-8,8a4,4,0,1,1-5.67-5.66l1.41-1.42-1.41-1.42-1.42,1.42a6,6,0,0,0,0,8.5A6,6,0,0,0,17,25a6,6,0,0,0,4.27-1.76l8-8A6,6,0,0,0,29.25,6.76Z"/><path d="M4.19,24.82a4,4,0,0,1,0-5.67l8-8a4,4,0,0,1,5.67,0A3.94,3.94,0,0,1,19,14a4,4,0,0,1-1.17,2.85L15.71,19l1.42,1.42,2.12-2.12a6,6,0,0,0-8.51-8.51l-8,8a6,6,0,0,0,0,8.51A6,6,0,0,0,7,28a6.07,6.07,0,0,0,4.28-1.76L9.86,24.82A4,4,0,0,1,4.19,24.82Z"/></svg>'
                    },
                },

                'gatsby-remark-copy-linked-files', // This copies files that are linked to from Markdown to the public folder
                'gatsby-remark-embed-snippet', // This allows files to be embedded as code snippets, e.g. on the Localisation page
                {
                    // This uses Prism to highlight code snippets
                    resolve: 'gatsby-remark-prismjs',
                    options: {
                        aliases: {
                            sh: 'bash',
                        },
                        noInlineHighlight: true,
                    }
                }
            ]
        },
        remarkPlugins: ['remark-preprocessor']
    },
    {
        // This allows us to use SCSS
        resolve: 'gatsby-plugin-sass',
        options: {
            additionalData: `@use './src/custom.module' as *;`, // adds this import into every SCSS file

            cssLoaderOptions: {
                esModule: false,
                modules: {
                    namedExport: false,
                    exportLocalsConvention: 'asIs',
                },
            },
            // cssLoaderOptions: {
            //   camelCase: false, // Preserve CSS names as-is, rather than converting to camelCase, when accessing in JS
            // },
            sassOptions: {
                // Don't show deprecations for dependencies eg, bootstrap
                quietDeps: true
            }
        }
    },
    'gatsby-plugin-minify-classnames', // This minifies classnames to reduce CSS size
    {
        // This will convert links to route changes, to ensure an SPA feel
        resolve: `gatsby-plugin-catch-links`,
        options: {
            excludePattern: /^\/$/, // avoid trapping the root route
        },
    },
    'gatsby-plugin-react-helmet', // This is used for putting information into the header, e.g. meta tags
    'gatsby-plugin-use-query-params', // This provides access to query parameters
    {
        // This generates the sitemap
        resolve: 'gatsby-plugin-sitemap',
        options: {
            query: `
                {
                    allSitePage {
                      nodes {
                        path
                      }
                    }
                }
            `,
            resolveSiteUrl: () => 'https://www.ag-grid.com',
            resolvePages: ({allSitePage}) => {
                // all the paths from under documentation, plus a few (php) entries not managed by gatsby
                const allPaths = allSitePage.nodes
                    .map((node) => {
                        return node.path;
                    });

                return allPaths.map(path => ({
                    path,
                    changefreq: "daily",
                    priority: 0.7
                }))
            },
            filterPages: ({path}) => {
                // exclude any components (jsx components used as part of the site)
                return path.startsWith("/components/");
            },
            serialize: ({path, changefreq, priority}) => {
                return {
                    url: path,
                    changefreq,
                    priority
                }
            },
            excludes: ['/documentation'],
            // this plugin will generate public/sitemap-index.xml - we rename it to sitemap.xml in gatsby-node.js#onPostBuild
            output: "/"
        }
    },
    {
        // This adds Google Tag Manager
        resolve: 'gatsby-plugin-google-tagmanager',
        options: {
            id: "GTM-T7JG534",
            includeInDevelopment: false,
        },
    },
    'gatsby-plugin-remove-generator', // This removes the generator meta tag so people don't know we use Gatsby
    {
        // This allows us to inline SVG files in "/images/inline-svgs" into the DOM
        resolve: "gatsby-plugin-react-svg",
        options: {
            rule: {
                include: /images\/inline-svgs\/.*\.svg/
            }
        }
    }
];

module.exports = {
    // The path prefix is used when the production site is generated. All URL paths will be prepended with it.
    pathPrefix: `${process.env.GATSBY_ROOT_DIRECTORY || ''}`,
    siteMetadata: {
        title: 'AG Grid Documentation',
        author: 'AG Grid',
        siteUrl: `https://${process.env.GATSBY_HOST || 'www.ag-grid.com'}`
    },
    plugins,
};
