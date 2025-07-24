/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

function getSnykFiles({ dir, found = [], ignore = ['node_modules', '.git'] }) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignore.includes(file)) {
            continue;
        }
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            getSnykFiles({ dir: full, found, ignore });
        } else if (file === '.snyk') {
            found.push(full);
        }
    }
    return found;
}

function extractIgnoredDependencyPaths(filePath) {
    const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
    const deps = new Set();

    if (doc && doc.ignore) {
        for (const vulnId in doc.ignore) {
            const entries = doc.ignore[vulnId];
            for (const entry of entries) {
                deps.add(...Object.keys(entry));
            }
        }
    }

    return Array.from(deps);
}

function getAllSnykIgnoreDeps(rootDir) {
    const snykFiles = getSnykFiles({ dir: rootDir });
    const allIgnored = new Set();

    for (const file of snykFiles) {
        const deps = extractIgnoredDependencyPaths(file);
        deps.forEach((dep) => allIgnored.add(dep));
    }

    return {
        snykFiles,
        allIgnored,
    };
}

function getParentLeafDeps(allIgnored) {
    const leafDeps = new Set();
    const parentDeps = new Set();
    Array.from(allIgnored).forEach((depPath) => {
        const deps = depPath.split('>');
        const leafDep = deps[deps.length - 1].trim();
        const parentDep = deps[0].trim();

        leafDeps.add(leafDep);
        parentDeps.add(parentDep);
    });

    return { parentDeps, leafDeps };
}

function main() {
    const rootDir = process.cwd();

    console.log('Looking for .snyk files in:', rootDir);
    const { snykFiles, allIgnored } = getAllSnykIgnoreDeps(rootDir);
    const { parentDeps, leafDeps } = getParentLeafDeps(allIgnored);

    console.log({
        snykFiles,
        allIgnored,
        parentDeps,
        leafDeps,
    });
}

main();
