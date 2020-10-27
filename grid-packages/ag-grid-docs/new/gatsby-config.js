require('dotenv').config();

module.exports = {
  pathPrefix: '/documentation',
  siteMetadata: {
    title: 'AG-Grid Documentation',
    author: 'AG-Grid'
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/src/pages`,
        ignore: ['**/examples/**'],
      },
    },
    'gatsby-plugin-layout',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages',
        ignore: ['**/examples/**'],
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'examples',
      }
    },
    {
      resolve: `gatsby-transformer-rehype`,
      options: {
        filter: node => node.sourceInstanceName === 'examples' && node.base.endsWith('.html'),
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'data',
        path: `${__dirname}/src/data/`,
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-custom-blocks',
            options: {
              blocks: {
                note: {
                  classes: 'note',
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
              },
            },
          },
          'gatsby-remark-component',
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              enableCustomId: true,
              removeAccents: true,
            },
          },
          'gatsby-remark-prismjs',
        ]
      }
    },
    'gatsby-transformer-json',
    'gatsby-plugin-sass',
    'gatsby-plugin-styled-components',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-algolia',
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.GATSBY_ALGOLIA_ADMIN_KEY,
        queries: require('./src/utils/algolia-queries')
      },
    }
  ]
};
