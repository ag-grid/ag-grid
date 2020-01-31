require("@babel/register")({
    presets: ["@babel/env", "@babel/react"],
    plugins: ["css-modules-transform"]
});

const fs = require('fs');
const Config = require('./chart-api/config.jsx');

console.log('Writing config to config.json...');

fs.writeFile('config.json', JSON.stringify(Config, null, 2), 'utf8', function(err) {
    if (err) {
        console.log('An error occurred :(');
        return console.log(err);
    }

    console.log('Finished!');
});
