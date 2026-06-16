module.exports = {
    extends: 'stylelint-config-standard',
    plugins: ['./plugins/stylelint-plugin-ag/index.mjs'],
    rules: {
        'comment-empty-line-before': [
            'always',
            {
                except: ['first-nested'],
                ignoreComments: ['/rtl:.*/'],
            },
        ],
        // NOTE: the intention here is that all our CSS rules have a single
        // class name in the selector that identifies the  component. Whenever
        // we need to target "the instance of a child component inside a parent"
        // use `:where(.ag-parent) .ag-child` to reduce the specificity.
        //
        // We allow state selectors like :focus and .ag-disabled on top of this,
        // because we want them to be slightly more specific. If for example a
        // component .ag-foo has a default color and a focus color, we want
        // `.ag-foo { color: black }` to set the default colour without also
        // removing the focus effect.
        'selector-max-specificity': [
            '0,1,0',
            {
                // add selectors here only if they refer to states, rather than components
                ignoreSelectors: [
                    '/^:/',
                    '[disabled]',
                    ':not(:disabled)',
                    '[readonly]',
                    '.ag-animating',
                    '.ag-disabled',
                    '.ag-selected',
                    '.ag-not-selected',
                    '.ag-checked',
                    '.ag-cell-inline-editing',
                    '.ag-row-hover',
                    '.ag-row-selected',
                    '.ag-picker-has-focus',
                    '.ag-sticky-label',
                    '.ag-header-cell-wrap-text',
                    '.ag-tab-selected',
                    '.ag-column-select-column-readonly',
                    '.ag-column-select-column-group-readonly',
                    '.ag-active-item',
                    '.ag-layout-print',
                    '.ag-layout-normal',
                    '.ag-layout-auto-height',
                    '.ag-tool-panel-animating',
                ],
            },
        ],
    },
    overrides: [
        {
            files: ['packages/**/*.css'],
            rules: {
                'ag/no-low-performance-key-selector': true,
                'ag/no-unknown-theme-variable': [
                    true,
                    {
                        paramSourceFiles: [
                            'packages/ag-stack/src/theming/shared/shared-css.ts',
                            'packages/ag-grid-community/src/theming/core/core-css.ts',
                            'packages/ag-grid-community/src/theming/parts/button-style/button-styles.ts',
                            'packages/ag-grid-community/src/theming/parts/checkbox-style/checkbox-styles.ts',
                            'packages/ag-grid-community/src/theming/parts/input-style/input-styles.ts',
                            'packages/ag-grid-community/src/theming/parts/tab-style/tab-styles.ts',
                            'packages/ag-grid-community/src/theming/parts/theme/themes.ts',
                        ],
                        // Variables that are valid but not derived from a theme param.
                        // Only add a variable here if it is intended to be used by
                        // customers; any other non-param variable must instead be
                        // prefixed --ag-internal-.
                        publicOutputVariables: [
                            '--ag-line-height',
                            '--ag-indentation-level',
                            '--ag-row-highlight-level',
                            '--ag-horizontal-size',
                        ],
                    },
                ],
            },
        },
    ],
};
