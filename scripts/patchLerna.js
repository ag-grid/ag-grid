/*
* This exists to allow bootstrapping when doing archive builds - lerna/npm trips up when we have a peerDep that doesn't
* exist in the registry yet (ie it's not been released yet)
*
* This script simply removes peerDeps from scripts as they're being installed - lerna reverts this local/in memory change
* so the source file is left in it's original state
*
* We can do away with this script when we move to workspaces or similar mechanism
* */
const fs = require('fs-extra');

const CWD = process.cwd();
const filename = `${CWD}/node_modules/@lerna/npm-install/npm-install.js`;
const version = require(`${CWD}/node_modules/lerna/package.json`).version;

// if lerna gets bumped up we need to ensure this patch is still valid - if it is just bump the version below to match
const expectedVersion = "5.6.2";

if(version !== expectedVersion) {
    console.error(`Lerna version is ${version} but scripts/patchLerna.js only supports ${expectedVersion}`);
    console.error(`Please inspect ${filename} and ensure that scripts/patchLerna.js is still valid/necessary.`);
}

const targetText = `// don't run lifecycle scripts
  delete json.scripts;`

const replacementText = `// don't run lifecycle scripts
  delete json.scripts;
  delete json.peerDependencies;`

const contents = fs.readFileSync(filename, 'utf8');
const newContents = contents.replace(targetText, replacementText);

if (newContents !== contents) {
    fs.writeFileSync(filename, newContents);
}
