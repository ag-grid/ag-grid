const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcssImport = require('postcss-import');
const postcssRtlcss = require('postcss-rtlcss');
const postcssUrl = require('postcss-url');

module.exports = [
    postcssImport(),
    postcssUrl({ url: 'inline' }),
    autoprefixer(),
    postcssRtlcss({
        ltrPrefix: `:where(.ag-ltr)`,
        rtlPrefix: `:where(.ag-rtl)`,
        bothPrefix: `:where(.ag-ltr, .ag-rtl)`,
    }),
    cssnano({
        preset: [
            'default',
            {
                discardComments: true,
                normalizeWhitespace: true,
                minifySelectors: true,
            },
        ],
    }),
];
