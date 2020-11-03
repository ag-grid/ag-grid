require('dotenv').config();

const plugins = [
  {
    // this allows IE11 to work in develop mode
    resolve: 'gatsby-plugin-compile-es6-packages',
    options: {
      modules: ['popper.js', 'query-string', 'split-on-first']
    }
  },
  {
    resolve: `gatsby-transformer-rehype`,
    options: {
      filter: node => node.sourceInstanceName === 'examples' && node.base.endsWith('.html'),
    },
  },
  'gatsby-transformer-json',
  'gatsby-plugin-layout',
  {
    resolve: 'gatsby-plugin-page-creator',
    options: {
      path: `${__dirname}/src/pages`,
      ignore: ['**/examples/**'],
    },
  },
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
                title: 'optional',
              },
              'warning': {
                classes: 'note warning',
                title: 'optional'
              },
              'info': {
                classes: 'note info',
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
            },
          },
        },
        {
          resolve: 'gatsby-remark-component',
          options: {
            components: ['grid-example', 'chart-example', 'api-documentation']
          }
        },
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
  {
    resolve: 'gatsby-plugin-sass',
    options: {
      data: `@import './src/custom.scss';`
    }
  },
  'gatsby-plugin-catch-links',
  'gatsby-plugin-react-helmet',

];

if (process.env.GATSBY_UPDATE_ALGOLIA === 'true') {
  plugins.push({
    resolve: 'gatsby-plugin-algolia',
    options: {
      appId: process.env.GATSBY_ALGOLIA_APP_ID,
      apiKey: process.env.GATSBY_ALGOLIA_ADMIN_KEY,
      queries: require('./src/utils/algolia-queries')
    }
  });
}

module.exports = {
  pathPrefix: '/documentation',
  siteMetadata: {
    title: 'AG-Grid Documentation',
    author: 'AG-Grid'
  },
  plugins
};
