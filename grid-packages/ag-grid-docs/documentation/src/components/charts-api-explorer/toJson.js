const path = require('path');
const root = path.resolve(__dirname, '../../');

require('app-module-path').addPath(root);

require("@babel/register")({
    presets: ["@babel/env", "@babel/react"],
    plugins: ["babel-plugin-transform-scss", "css-modules-transform"],
});

const fs = require('fs');
const Config = require('./config.jsx');

console.log('Writing config to api.json...');

const convertWhitespace = (key, value) => key === 'description' ? value.replace(/\s+/g, ' ') : value;

fs.writeFile('../../../doc-pages/charts-api/api.json', JSON.stringify(Config, convertWhitespace, 2), 'utf8', function(err) {
    if (err) {
        console.log('An error occurred :(');
        return console.log(err);
    }

    console.log('Finished!');
});
