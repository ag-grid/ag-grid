const fs = require("fs");

if(!fs.existsSync(`node_modules.nosync`)) {
    fs.mkdirSync(`node_modules.nosync`);
}
if(!fs.existsSync(`node_modules`)) {
    fs.symlinkSync('node_modules.nosync', 'node_modules')
}
