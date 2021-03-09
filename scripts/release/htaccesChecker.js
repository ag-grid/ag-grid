const fs = require('fs');

const htaccess = fs.readFileSync('./grid-packages/ag-grid-docs/.htaccess', 'utf8');

const redirectsTargets = htaccess.split('\n')
    .filter(line => line.includes('Redirect 301'))
    .filter(line => !line.includes("https://medium.com"))
    .filter(line => !line.includes("gallery"))
    .map(line => line.replace(/^.* (.*)$/, "$1", ""))
    .map(line => line.replace(/^\/(javascript|angular|react|vue)-(grid|charts)\//, ""))

redirectsTargets.forEach(redirectsTarget => {
    if (!fs.existsSync(`./grid-packages/ag-grid-docs/documentation/doc-pages/${redirectsTarget}`)) {
        console.error(`Redirect ending with ${redirectsTarget} - this directory doesn't exist under ./grid-packages/ag-grid-docs/documentation/doc-pages/` );
    }
})
