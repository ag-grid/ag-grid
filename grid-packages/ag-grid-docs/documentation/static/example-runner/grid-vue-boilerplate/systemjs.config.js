(function (global) {
    System.config({
        transpiler: 'plugin-babel',
        defaultExtension: 'js',
        paths:
                {
                    // paths serve as alias
                    "npm:": "https://cdn.jsdelivr.net/npm/",
            ...systemJsPaths
        },
        map: {
            // babel transpiler
            'plugin-babel': 'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
            'systemjs-babel-build': 'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

            css: boilerplatePath + "css.js",

            // vuejs
            'vue': 'npm:vue@2.6.12/dist/vue.min.js',
            // vue property decorator
            'vue-class-component': 'npm:vue-class-component@6.3.2/dist/vue-class-component.min.js',
            'vue-property-decorator': 'npm:vue-property-decorator@7.2.0/lib/vue-property-decorator.umd.js',

            app: appLocation + 'app',
            // systemJsMap comes from index.html
            ...systemJsMap
        },
        packages: {
            'vue': {
                defaultExtension: 'js'
            },
            'vue-class-component': {
                defaultExtension: 'js'
            },
            'vue-property-decorator': {
                defaultExtension: 'js'
            },
            app: {
                defaultExtension: 'js'
            },
            'ag-grid-vue': {
                main: './lib/AgGridVue.js',
                defaultExtension: 'js'
            },
            'ag-grid-community': {
                main: './dist/ag-grid-community.cjs.min.js',
                defaultExtension: 'js'
            },
            'ag-grid-enterprise': {
                main: './dist/ag-grid-enterprise.cjs.min.js',
                defaultExtension: 'js'
            },
            '@ag-grid-community/vue': {
                main: './lib/AgGridVue.js',
                defaultExtension: 'js'
            }
        },
        meta: {
            '*.js': {
                babelOptions: {
                    stage1: true,
                    stage2: true,
                    es2015: true
                }
            },
            '*.css': { loader: 'css' }
        }
    });
})(this);
