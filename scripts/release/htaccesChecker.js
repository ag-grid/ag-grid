const fs = require('fs');

if(!fs.existsSync("./grid-packages/ag-grid-docs/documentation/public")) {
    console.error("./grid-packages/ag-grid-docs/documentation/public doesn't exist - has the documentation build & package been run yet?");
    process.exit(1);
}

const htaccess = fs.readFileSync('./grid-packages/ag-grid-docs/.htaccess', 'utf8');

const excludes = ['medium.com', 'ecommerce', 'www.ag-grid.com']
const redirectsTargets = htaccess.split('\n')
    .filter(line => line.includes('Redirect 301'))
    .filter(line => !excludes.some(exclude => line.includes(exclude)))
    .map(line => line.replace(/^.* (.*)$/, "$1", ""))

let errors = 0;
redirectsTargets.forEach(redirectsTarget => {
    if (!fs.existsSync(`./grid-packages/ag-grid-docs/documentation/public/${redirectsTarget}`) &&
        !fs.existsSync(`grid-packages/ag-grid-docs/src/${redirectsTarget}/index.php`)) {
        console.error(`Redirect ending with ${redirectsTarget} - this directory doesn't exist under ./grid-packages/ag-grid-docs/documentation/public/ or under /grid-packages/ag-grid-docs/src/` );
        errors = 1;
    }
});

process.exit(errors);


