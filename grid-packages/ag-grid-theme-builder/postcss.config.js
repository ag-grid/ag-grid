module.exports = {
  plugins: {
    'postcss-rtlcss': {
      ltrPrefix: '.ag-ltr',
      rtlPrefix: '.ag-rtl',
      hooks: {
        pre(root, postcss) {
          console.log('root.nodes', root.nodes);
        },
      },
    },
    'postcss-nesting': {},
  },
};
