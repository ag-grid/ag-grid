#!/usr/bin/env node

/**
 * This script is used to generate config to drive the Cypress tests that are run against build.ag-grid.com in TeamCity.
 * The build will produce the file cypress.config.AUTO.json which will be collected as an artifact of the full build and then
 * used by the Cypress job in TeamCity to run the correct tests.
 */

const fs = require('fs-extra');
var glob = require("glob")
const basePath = './doc-pages/';

(async () => {
    console.log('Generating Cypress Test Config');

    const examples = getExamples();
    const apiPages = getApiDocumentationPages();

    try {        
        await fs.writeJson('./cypress.config.AUTO.json', { examples, apiPages })
        console.log('Generating Cypress Test Config: Success!')
    } catch (err) {
        console.error(err)
    }
})();

function getExamples() {
    var files = fs.readdirSync(basePath);
    var pageGroups = [];

    files.forEach(page => {

        // We need to handle stale folders that have been deleted from Git but still exist due to containing unversioned files.
        const indexFilePaths = [basePath + page + '/index.md', basePath + page + '/_index.md'];
        const hasIndexMarkdown = indexFilePaths.some(p => fs.existsSync(p));
        const exampleDir = basePath + page + '/examples/';
        if (hasIndexMarkdown && fs.existsSync(exampleDir)) {

            const usedExamples = []
            const fileNames = glob.sync(basePath + page + "/*.md")

            fileNames.forEach(fileName => {
                const indexMarkdownFile = fs.readFileSync(fileName).toString();

                const gridExampleReg = /<grid-example.*?name='(.*?)'.*/g
                const gridExamples = indexMarkdownFile.matchAll(gridExampleReg);
                const chartExampleReg = /<chart-example.*?name='(.*?)'.*/g
                const chartExamples = indexMarkdownFile.matchAll(chartExampleReg);
                for (const match of gridExamples) {
                    usedExamples.push(match[1])
                }
                for (const match of chartExamples) {
                    usedExamples.push(match[1])
                }

            })

            const examples = fs.readdirSync(exampleDir);
            let pageExamples = [];

            examples.forEach(example => {

                if (!usedExamples.includes(example)) {
                    console.warn('Stale example is not referenced in the docs should it be deleted?', page, example)
                } else {
                    const exFolder = exampleDir + '/' + example;

                    const generatedFolder = `${exFolder}/_gen`
                    if (fs.existsSync(generatedFolder)) {
                        // Examples follow the _gen generated pattern           
                        ['modules', 'packages'].forEach(importType => {
                            const importTypeFolder = `${exFolder}/_gen/${importType}/`;
                            if (fs.existsSync(importTypeFolder)) {
                                const frameworks = fs.readdirSync(importTypeFolder);
                                frameworks.forEach(framework => {
                                    pageExamples.push({ page, example, importType, framework, url: `${page}/${example}/${importType}/${framework}/index.html` });
                                })
                            }
                        })
                    } else {

                        // Follows the hand written direct copy examples
                        const customExampleFolder = exampleDir + example;

                        const customContents = fs.readdirSync(customExampleFolder);
                        if (customContents.some(f => f === 'app' || !fs.lstatSync(customExampleFolder + '/' + f).isDirectory())) {
                            // if there is a file at this level then assume it is the example code
                            pageExamples.push({ page, example, framework: 'UNKNOWN', importType: 'UNKNOWN', url: `${page}/${example}/index.html` });

                        } else {
                            // assume we have framework folders 
                            const frameworks = fs.readdirSync(customExampleFolder);
                            frameworks.forEach(framework => {
                                // Just put down as importType: modules so that these tests get run under modules filter
                                pageExamples.push({ page, example, framework, importType: 'modules', url: `${page}/${example}/${framework}/index.html` });
                            })
                        }
                    }
                }

            })
            pageGroups.push({ page: page, examples: pageExamples });
        }
    })
    return pageGroups;
}

function getApiDocumentationPages() {
    var files = fs.readdirSync(basePath);
    var pageGroups = [];

    files.forEach(page => {
        const indexFilePath = basePath + page + '/index.md';
        if (fs.existsSync(indexFilePath)) {
            const indexFile = fs.readFileSync(indexFilePath).toString();

            const apiWithNamesReg = /<api-documentation.*?(names).*?api-documentation>/g;
            const apiReg = /<api-documentation.*?(source).*?api-documentation>/g;

            const matches = indexFile.match(apiReg)?.length;
            const matchesWithNames = indexFile.match(apiWithNamesReg)?.length;

            if (indexFile.includes('<api-documentation') && (matches !== matchesWithNames)) {
                // We look for the base api-documentation usages as opposed to the use cases where they are just pulling out 
                // a named property. As testing those cases is a duplicate.
                pageGroups.push({ page: page });
            }
        }
    })
    return pageGroups;
}


