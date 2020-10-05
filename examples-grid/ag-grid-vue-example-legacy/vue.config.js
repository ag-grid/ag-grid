const path = require('path');

module.exports = {
    configureWebpack: {
        resolve: {
            symlinks: false,
            alias: {
                // Make sure *our* version of ag-grid & vue is always loaded.
                // This is needed for `yarn link / npm link` to work and prevent duplicate versions of these libs
                // being loaded
                '@ag-grid-community/core$': path.resolve(__dirname, 'node_modules/@ag-grid-community/core'),
                vue$: path.resolve(__dirname, 'node_modules/vue/dist/vue.runtime.common.js'),
                'vue-class-component$': path.resolve(__dirname, 'node_modules/vue-class-component/dist/vue-class-component.common.js')
            }
        },
        performance: {
            hints: false
        }
    }
};
