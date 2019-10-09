const fs = require('fs');
const glob = require("glob");

// ensure the common module is added first
const communityModules = glob.sync("../../community-modules/*")
    .map(module => `require('${module}');`);

const modules = glob.sync("*Module.js")
    .map(module => module.replace('.js', ''))
    .map(module => `require('./${module}');`);

const css = glob.sync("./node_modules/ag-grid-community/dist/styles/*.css")
    .filter(css => css.indexOf('.min.css') === -1)
    .map(css => css.replace('./node_modules/', ''))
    .map(css => `require('${css}');`);

const webpackBase = fs.readFileSync('./webpack-base.config.js', 'UTF-8').toString();

const allModules = communityModules.join('\n').concat('\n')
    .concat(modules.join('\n').concat('\n'));

const webpackNoStyles = allModules.concat(webpackBase);
fs.writeFileSync('./webpack-no-styles.js', webpackNoStyles);

const webpackStyles = webpackNoStyles.concat(css.join('\n'));
fs.writeFileSync('./webpack-with-styles.js', webpackStyles);
