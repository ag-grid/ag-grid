```
resolve: 'gatsby-transformer-remark',
options: {
  plugins: [
    {
      resolve: 'gatsby-remark-token-replace',
      options: {
        replacements: {
          ':grid_version:': agGridVersion,
          ':charts_version:': agChartsVersion
        }
      }
    },
```
