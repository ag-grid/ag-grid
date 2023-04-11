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
                // 'gatsby-remark-attr', // This allows attributes to be used in Markdown, e.g. for images//
                // {
                //     // This adds custom blocks to Markdown, e.g. for info or warning messages, and our framework-specific sections
                //     resolve: 'gatsby-remark-custom-blocks',
                //     options: {
                //         blocks: {
                //             note: {
                //                 classes: 'note',
                //                 title: 'optional',
                //             },
                //             warning: {
                //                 classes: 'note warning',
                //                 title: 'optional'
                //             },
                //             'only-javascript': {
                //                 classes: 'javascript-only-section',
                //             },
                //             'only-angular': {
                //                 classes: 'angular-only-section',
                //             },
                //             'only-react': {
                //                 classes: 'react-only-section',
                //             },
                //             'only-vue': {
                //                 classes: 'vue-only-section',
                //             },
                //             'only-angular-or-vue': {
                //                 classes: 'angular-or-vue-only-section',
                //             },
                //             'only-angular-or-react': {
                //                 classes: 'angular-or-react-only-section',
                //             },
                //             'only-javascript-or-angular-or-vue': {
                //                 classes: 'angular-or-vue-or-javascript-only-section',
                //             },
                //             'only-javascript-or-angular-or-react': {
                //                 classes: 'angular-or-react-or-javascript-only-section',
                //             },
                //             'only-frameworks': {
                //                 classes: 'frameworks-only-section',
                //             }
                //         },
                //     },
                // },
                // This ensures the parent tag of Markdown content is a div rather than a p, to avoid warnings in the browser
                // 'gatsby-remark-component-parent2div',
                // {
                //     // This creates links for each header element, with an icon that appears to the left of the header on hover
                //     resolve: 'gatsby-remark-autolink-headers',
                //     options: {
                //         enableCustomId: true,
                //         removeAccents: true,
                //         icon: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="link" class="svg-inline--fa fa-link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path></svg>'
                //     },
                // },

                // 'gatsby-remark-copy-linked-files', // This copies files that are linked to from Markdown to the public folder
                // 'gatsby-remark-embed-snippet', // This allows files to be embedded as code snippets, e.g. on the Localisation page
                // {
                //     // This uses Prism to highlight code snippets
                //     resolve: 'gatsby-remark-prismjs',
                //     options: {
                //         aliases: {
                //             sh: 'bash',
                //         },
                //         noInlineHighlight: true,
                //     }
                // }
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
