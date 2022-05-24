(function (global) {
    // simplified version of Object.assign for es3
    function assign() {
        var result = {};
        for (var i = 0, len = arguments.length; i < len; i++) {
            var arg = arguments[i];
            for (var prop in arg) {
                result[prop] = arg[prop];
            }
        }
        return result;
    }

    System.config({
        transpiler: 'plugin-babel',
        defaultExtension: 'js',
        paths: {
            'npm:': 'https://unpkg.com/'
        },
        map: assign(
            {
                // babel transpiler
                'plugin-babel': 'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
                'systemjs-babel-build': 'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

                // css plugin
                'css': 'npm:systemjs-plugin-css@0.1.37/css.js',

                // vuejs
                'vue': 'npm:vue@3.2.29/dist/vue.esm-browser.js',
                '@vue/reactivity': 'npm:@vue/reactivity@3.0.0/dist/reactivity.esm-browser.js',

                // vue class component
                'vue-class-component': 'npm:vue-class-component@^8.0.0-beta.3/dist/vue-class-component.cjs.js',

                app: appLocation + 'app'
            },
            systemJsMap
        ), // systemJsMap comes from index.html

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
            'ag-charts-vue3': {
                main: './lib/AgChartsVue.js',
                defaultExtension: 'js'
            },
            'ag-charts-community': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
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
