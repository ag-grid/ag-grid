const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');

const getRequiredInputs = async () => {
    const answers = await inquirer
        .prompt([
            {
                name: 'gridOrCharts',
                message: 'Will this be an [C]harts or [G]grid package [C|c/G|g]?',
            },
            {
                name: 'enterpriseOrCommunity',
                message: 'Will this be an [E]nterprise or [C]ommunity package [E|e/C|c]?',
            },
            {
                name: 'packageName',
                message: 'What is the module name (will become @ag-grid-community/[packageName] / @ag-grid-enterprise/[packageName]) ?',
            },
        ]);

    let grid = true;
    switch (answers.gridOrCharts.toLowerCase()) {
        case 'c':
            grid = false;
            break;
        case 'g':
            break;
        default:
            console.error(`!! Unknown value for package type: "${answers.gridOrCharts}". Please specify either "C" or "G"`);
            process.exit(1);
    }

    let enterprise = false;
    switch (answers.enterpriseOrCommunity.toLowerCase()) {
        case 'e':
            enterprise = true;
            break;
        case 'c':
            break;
        default:
            console.error(`!! Unknown value for package type: "${answers.enterpriseOrCommunity}". Please specify either "E" or "C"`);
            process.exit(1);
    }

    return {grid, enterprise, packageName: answers.packageName};
};

const main = async () => {
    const {grid, enterprise, packageName} = await getRequiredInputs();

    const moduleName = `@ag-${grid ? 'grid' : 'charts'}-${enterprise ? 'enterprise' : 'community'}/${packageName}`;
    const moduleDirRoot = `${grid ? 'grid' : 'charts'}-${enterprise ? 'enterprise' : 'community'}-modules`;
    const moduleDir = `${moduleDirRoot}/${packageName}`;

    if(fs.existsSync(`./${moduleDir}`)) {
        console.error(`${moduleDir} already exists - exiting.`);
        process.exit(1);
    }

    const sourceVersionModule = `${grid ? 'core' : enterprise ? 'ag-charts-enterprise' : 'ag-charts-community'}`
    const packageVersionNumber = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../${moduleDirRoot}/${sourceVersionModule}/package.json`), 'UTF-8')).version;
    const templatePackageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, path.resolve(__dirname, `./${grid ? 'grid' : 'charts'}-template.json`)), 'UTF-8'));

    templatePackageJson.name = moduleName;
    templatePackageJson.version = packageVersionNumber;
    templatePackageJson.license = enterprise ? 'Commercial' : 'MIT';
    templatePackageJson.dependencies[grid ? '@ag-grid-community/core' : 'ag-charts-community'] = `~${packageVersionNumber}`;
    if(enterprise) {
        templatePackageJson.dependencies[grid ? '@ag-grid-enterprise/core' : 'ag-charts-enterprise'] = `~${packageVersionNumber}`;
    }

    fs.mkdirSync(`./${moduleDir}`);
    fs.mkdirSync(`./${moduleDir}/src`);

    fsExtra.copySync(path.resolve(__dirname, './.npmignore'), `./${moduleDir}/.npmignore`);
    fsExtra.copySync(path.resolve(__dirname, './tsconfig.cjs.es5.docs.json'), `./${moduleDir}/tsconfig.cjs.es5.docs.json`);
    fsExtra.copySync(path.resolve(__dirname, './tsconfig.cjs.es5.json'), `./${moduleDir}/tsconfig.cjs.es5.json`);
    fsExtra.copySync(path.resolve(__dirname, './tsconfig.cjs.es6.json'), `./${moduleDir}/tsconfig.cjs.es6.json`);
    fsExtra.copySync(path.resolve(__dirname, './tsconfig.esm.es5.json'), `./${moduleDir}/tsconfig.esm.es5.json`);
    fsExtra.copySync(path.resolve(__dirname, './tsconfig.esm.es6.json'), `./${moduleDir}/tsconfig.esm.es6.json`);
    fsExtra.copySync(path.resolve(__dirname, './tsconfig.test.json'), `./${moduleDir}/tsconfig.test.json`);
    fsExtra.copySync(path.resolve(__dirname, './jest.config.js'), `./${moduleDir}/jest.config.js`);
    fsExtra.copySync(path.resolve(__dirname, './main.ts'), `./${moduleDir}/src/main.ts`);

    fs.writeFileSync(`./${moduleDir}/package.json`, JSON.stringify(templatePackageJson, null, 4), 'UTF-8');
};

main();
