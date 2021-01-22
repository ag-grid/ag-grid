"use strict";

const fs = require(`fs-extra`);
const path = require(`path`);

function loadNodeContent(fileNode) {
    const sourcePath = path.dirname(fileNode.absolutePath);

    // this allows Markdown files to import other Markdown files using md-include syntax
    return fs.readFile(fileNode.absolutePath, `utf-8`).then(value => {
        if (fileNode.extension !== 'md') { return value; }

        return value.replace(/\bmd-include:(\S+)/g, (_, filename) => {
            const includeFileName = path.join(sourcePath, `_${filename}`);

            return fs.readFileSync(includeFileName);
        });
    });
}

exports.createFilePath = require(`./create-file-path`);
exports.createRemoteFileNode = require(`./create-remote-file-node`);
exports.createFileNodeFromBuffer = require(`./create-file-node-from-buffer`);
exports.loadNodeContent = loadNodeContent;