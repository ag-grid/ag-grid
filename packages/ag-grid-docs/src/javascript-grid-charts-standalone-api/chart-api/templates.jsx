import {formatJson, deepClone} from "./utils.jsx";

export const data = [{
    month: 'Jan',
    revenue: 155000,
    profit: 33000
}, {
    month: 'Feb',
    revenue: 123000,
    profit: 35500
}, {
    month: 'Mar',
    revenue: 172500,
    profit: 41000
}, {
    month: 'Apr',
    revenue: 185000,
    profit: 50000
}];

export const series = [{
    type: 'column',
    xKey: 'month',
    yKeys: ['revenue', 'profit'],
}];

export const getTemplates = (framework, boilerplate, options) => {
    const formattedOptions = deepClone(options);
    formattedOptions.data = data;

    if (!formattedOptions.series) {
        formattedOptions.series = series;
    }

    switch (framework) {
        case 'vanilla':
            return {
                'index.html': boilerplate[framework]['index.html'],
                'main.js': boilerplate[framework]['main.js'].replace('$OPTIONS$', formatJson(formattedOptions))
            };
        case 'react':
            return {
                'index.html': boilerplate[framework]['index.html'],
                'index.jsx': boilerplate[framework]['index.jsx'].replace('$OPTIONS$', formatJson(formattedOptions)),
                'systemjs.config.js': boilerplate[framework]['systemjs.config.js']
            };
        case 'angular':
            return {
                'app/app.component.ts': boilerplate[framework]['app/app.component.ts'].replace('$OPTIONS$', formatJson(formattedOptions)),
                'app/app.component.html': boilerplate[framework]['app/app.component.html'],
                'app/app.module.ts': boilerplate[framework]['app/app.module.ts'],
                'index.html': boilerplate[framework]['index.html'],
                'main.ts': boilerplate[framework]['main.ts'],
                'systemjs-angular-loader.js': boilerplate[framework]['systemjs-angular-loader.js'],
                'systemjs.config.js': boilerplate[framework]['systemjs.config.js']
            };
        case 'vue':
            return {
                'index.html': boilerplate[framework]['index.html'],
                'main.js': boilerplate[framework]['main.js'].replace('$OPTIONS$', formatJson(formattedOptions)),
                'systemjs.config.js': boilerplate[framework]['systemjs.config.js'],
            };
        default:
            return {};
    }
};
