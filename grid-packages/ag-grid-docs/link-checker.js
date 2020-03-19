const glob = require('glob');
const fs = require('fs');
const path = require('path');
const request = require('request');

const checkedUrls = {
    'src/archive/index.php': '',
};

function getUrlContents(url) {
    return new Promise(function(resolve, reject) {
        request(
            url,
            { followRedirect: false, followAllRedirects: false, headers: { 'Cache-Control': 'no-cache' } },
            (error, response, body) => resolve([response.statusCode, body]));
    });
}

function createUrl(file) {
    return 'http://localhost:8080/' + file.replace('src/', '');
}

async function isValidUrl(file, url, id) {
    let isValid = false;

    const currentDirectory = path.dirname(file);
    let targetPath;

    if (url.startsWith('#')) {
        targetPath = file;
    } else {
        targetPath = path.join(url.startsWith('/') ? 'src' : currentDirectory, url.split('?')[0]);
    }

    if (targetPath.endsWith('/')) {
        targetPath = path.join(targetPath, 'index.php');
    }

    if (checkedUrls[targetPath] !== undefined || fs.existsSync(targetPath)) {
        if (id) {
            if (!checkedUrls[targetPath]) {
                const [statusCode, contents] = await getUrlContents(createUrl(targetPath));

                if (statusCode === 200) {
                    checkedUrls[targetPath] = contents;
                }
            }

            const html = checkedUrls[targetPath];
            const idExists = new RegExp(`id=["']${id}["']`).test(html);
            const generatedIds = [];

            if (!idExists) {
                const headerPattern = /<h([1-4])>(.+)<\/h\1>/g;
                let matches;

                while ((matches = headerPattern.exec(html))) {
                    const generatedId = matches[2]
                        .replace(/<\/?[^\>]+\>/g, '')
                        .replace(/[^\w\d\s\(\.\-]/g, '')
                        .replace(/[\s\(\.]/g, '-')
                        .toLowerCase();

                    generatedIds.push(generatedId);
                }
            }

            isValid = idExists || generatedIds.indexOf(id) >= 0;
        } else {
            isValid = true;

            if (checkedUrls[targetPath] === undefined) {
                checkedUrls[targetPath] = '';
            }
        }
    }

    return isValid;
}

async function verifyFile(file) {
    const regex = /<a.*href=['"]([^'"]+)['"]/g;
    const [statusCode, contents] = await getUrlContents(createUrl(file));

    if (statusCode !== 200) {
        //console.log(`\u2753 Ignoring ${file} (${statusCode})`);
    }

    let matches;
    let urlCount = 0;
    let validUrls = [];
    let invalidUrls = [];
    let ignoredUrls = [];

    while ((matches = regex.exec(contents))) {
        const [urlMatch] = matches.slice(1);
        const [url, id] = urlMatch.split('#');
        const ignoreList = ['mailto:', 'dist/', 'http'];

        if (ignoreList.some(x => url.startsWith(x)) || (id && id.startsWith('example-'))) {
            ignoredUrls.push(url);
        } else {
            const isValid = await isValidUrl(file, url, id);

            if (isValid) {
                validUrls.push(urlMatch);
            } else {
                invalidUrls.push(urlMatch);
            }
        }

        urlCount++;
    }

    if (invalidUrls.length) {
        console.log(`\u274C Found errors in ${file}. Invalid URLs found linking to:\n-> ${invalidUrls.join('\n-> ')}`);
    } else {
        //console.log(`\u2714 Verified ${validUrls.length} links in ${file} (ignored ${ignoredUrls.length})`);
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

glob('src/javascript-*/*.php', {}, async (_, files) => await asyncForEach(files, verifyFile));
