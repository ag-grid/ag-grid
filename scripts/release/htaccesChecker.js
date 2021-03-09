const fs = require('fs');

if(!fs.existsSync("./grid-packages/ag-grid-docs/documentation/public")) {
    console.error("./grid-packages/ag-grid-docs/documentation/public doesn't exist - has the documentation build & package been run yet?");
    process.exit(1);
}

const htaccess = fs.readFileSync('./grid-packages/ag-grid-docs/.htaccess', 'utf8');

const redirectsTargets = htaccess.split('\n')
    .filter(line => line.includes('Redirect 301'))
    .filter(line => !line.includes("https://medium.com"))
    .map(line => line.replace(/^.* (.*)$/, "$1", ""))
    .filter(line => line !== 'https://www.ag-grid.com/')

let errors = 0;
redirectsTargets.forEach(redirectsTarget => {
    if (!fs.existsSync(`./grid-packages/ag-grid-docs/documentation/public/${redirectsTarget}`) &&
        !fs.existsSync(`grid-packages/ag-grid-docs/src/${redirectsTarget}/index.php`)) {
        console.error(`Redirect ending with ${redirectsTarget} - this directory doesn't exist under ./grid-packages/ag-grid-docs/documentation/public/ or under /grid-packages/ag-grid-docs/src/` );
        errors = 1;
    }
});

process.exit(errors);


