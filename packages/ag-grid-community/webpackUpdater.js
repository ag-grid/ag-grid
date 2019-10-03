const fs = require('fs');
const glob = require("glob");

const modules = glob.sync("*Module.js")
    .map(module => module.replace('.js', ''))
    .map(module => `require('./${module}');`);

const css = glob.sync("./dist/styles/*.css")
    .filter(css => css.indexOf('.min.css') === -1)
    .map(css => `require('${css}');`);

const webpackBase = fs.readFileSync('./webpack-base.config.js', 'UTF-8').toString();

const allModules = modules.join('\n').concat('\n');

const webpackNoStyles = allModules.concat(webpackBase);
fs.writeFileSync('./webpack-no-styles.js', webpackNoStyles);

const webpackStyles = webpackNoStyles.concat(css.join('\n'));
fs.writeFileSync('./webpack-with-styles.js', webpackStyles);
