module.exports = {
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
    {
      resolve: 'gatsby-transformer-json'
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
      }
    },
    {
      resolve: 'gatsby-plugin-sass'
    },
    'gatsby-plugin-catch-links',
    'gatsby-plugin-react-helmet',
  ]
};
